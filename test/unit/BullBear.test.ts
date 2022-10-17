import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { BullBear, MockV3Aggregator, VRFCoordinatorV2Mock } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BullBear", () => {
          let bullBear: BullBear;
          let mockPriceFeed: MockV3Aggregator;
          let deployer: SignerWithAddress;
          let keeperInterval: BigNumber;
          let lastPrice: BigNumber;
          let vrfCoordinatorV2: VRFCoordinatorV2Mock;

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              bullBear = await ethers.getContract("BullBear");
              mockPriceFeed = await ethers.getContract("MockV3Aggregator");
              keeperInterval = await bullBear.getInterval();
              lastPrice = await bullBear.getLastPrice();
              vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock");
          });

          describe("safeMint", () => {
              it("mints first and only NFT", async () => {
                  await bullBear.safeMint(deployer.address);
                  const tokenURI = await bullBear.tokenURI(0);

                  assert.equal(
                      tokenURI,
                      "https://ipfs.io/ipfs/QmRXyfi3oNZCubDxiVFre3kLZ8XeGt6pQsnAQRZ7akhSNs?filename=gamer_bull.json"
                  );
                  await expect(bullBear.tokenURI(1)).to.be.revertedWith("ERC721: invalid token ID");
              });
          });

          describe("checkUpkeep", () => {
              it("returns false if enough time hasn't passed", async () => {
                  await network.provider.send("evm_increaseTime", [keeperInterval.toNumber() - 5]); // use a higher number here if this test fails
                  await network.provider.request({
                      method: "evm_mine",
                      params: []
                  });
                  const { upkeepNeeded } = await bullBear.callStatic.checkUpkeep("0x"); // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded);
              });
          });

          describe("performUpkeep", () => {
              it("runs if checkupkeep is true", async () => {
                  await network.provider.send("evm_increaseTime", [keeperInterval.toNumber() + 1]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: []
                  });
                  const tx = await bullBear.performUpkeep("0x");
                  assert(tx);
              });
              it("reverts if checkup is false", async () => {
                  await expect(bullBear.performUpkeep("0x")).to.be.revertedWithCustomError(
                      bullBear,
                      "BullBear__UpkeepNotNeeded"
                  );
              });
              it("changes image to bear if price drops", async () => {
                  await bullBear.safeMint(deployer.address);
                  mockPriceFeed.updateAnswer(lastPrice.sub(1));
                  await network.provider.send("evm_increaseTime", [keeperInterval.toNumber() + 1]);
                  await network.provider.request({
                      method: "evm_mine",
                      params: []
                  });

                  await new Promise<void>(async (resolve, reject) => {
                      bullBear.once("TokensUpdated", async () => {
                          // assert throws an error if it fails, so we need to wrap
                          // it in a try/catch so that the promise returns event
                          // if it fails.
                          try {
                              const tokenURI = await bullBear.tokenURI(0);
                              assert.equal(
                                  tokenURI,
                                  "https://ipfs.io/ipfs/Qmdx9Hx7FCDZGExyjLR6vYcnutUR8KhBZBnZfAPHiUommN?filename=beanie_bear.json"
                              );

                              resolve(); // if try passes, resolves the promise
                          } catch (e) {
                              reject(e); // if try fails, rejects the promise
                          }
                      });

                      // kicking off the event by mocking the chainlink keepers and vrf coordinator
                      const tx = await bullBear.performUpkeep("0x");
                      const txReceipt = await tx.wait(1);
                      await vrfCoordinatorV2.fulfillRandomWordsWithOverride(
                          txReceipt.events![1].args!.requestId,
                          bullBear.address,
                          [0]
                      );
                  });
              });
          });
      });
