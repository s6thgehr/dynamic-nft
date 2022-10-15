import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";

const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network } = hre;
    const { deploy, log } = deployments;
    const accounts = await ethers.getSigners();

    if (developmentChains.includes(network.name)) {
        log("----------------------------------------------------");
        log("Deploying mocks...");

        const decimals = networkConfig[network.name].decimals;
        const initialAnswer = networkConfig[network.name].initialAnswer;

        const mockPriceFeed = await deploy("MockV3Aggregator", {
            from: accounts[0].address,
            args: [decimals, initialAnswer],
            log: true
        });
        log(`MockPriceFeed deployed at ${mockPriceFeed.address}`);
        log("----------------------------------");

        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        );
        log(
            "Please run `yarn hardhat console --network localhost` to interact with the deployed smart contracts!"
        );
        log("----------------------------------");
    }
};

export default deployMocks;
deployMocks.tags = ["all", "mocks"];
