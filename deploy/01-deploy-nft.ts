import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const deployBullBear: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    const { deployments, network } = hre;
    const { deploy, log } = deployments;
    const accounts = await ethers.getSigners();
    let priceFeedAddress: string | undefined;

    log("----------------------------------------------------");
    log("Deploying BullBear and waiting for confirmations...");

    if (developmentChains.includes(network.name)) {
        const mockPriceFeed = await ethers.getContract("MockV3Aggregator");
        priceFeedAddress = mockPriceFeed.address;
    } else {
        priceFeedAddress = networkConfig[network.name].BTCUSDPriceFeedAddress;
    }

    const interval = networkConfig[network.name].keepersUpdateInterval;
    const bullBear = await deploy("BullBear", {
        from: accounts[0].address,
        args: [interval, priceFeedAddress],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0
    });
    log(`BullBear deployed at ${bullBear.address}`);
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(bullBear.address, []);
    }
};

export default deployBullBear;
deployBullBear.tags = ["all", "bullBear"];
