import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { BullBear } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BullBear", () => {
          let bullBear: BullBear;
          let deployer: SignerWithAddress;

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              bullBear = await ethers.getContract("BullBear");
          });

          it("mints first and only NFT", async () => {
              await bullBear.safeMint(deployer.address);
              const tokenURI = await bullBear.tokenURI(0);
              // Assert that NFT with default tokenURI is minted, when using VRF this assertion is useless
              assert.equal(
                  tokenURI,
                  "https://ipfs.io/ipfs/QmRXyfi3oNZCubDxiVFre3kLZ8XeGt6pQsnAQRZ7akhSNs?filename=gamer_bull.json"
              );
              await expect(bullBear.tokenURI(1)).to.be.revertedWith(
                  "ERC721: invalid token ID"
              );
          });
      });
