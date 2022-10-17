import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

const FUND_AMOUNT = ethers.utils.parseEther("2");

const deployBullBear: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, network } = hre;
    const { deploy, log } = deployments;
    const accounts = await ethers.getSigners();
    let priceFeedAddress: string | undefined;
    let vrfCoordinatorAddress: string | undefined;
    let subscriptionId: string | undefined;

    log("----------------------------------------------------");
    log("Deploying BullBear and waiting for confirmations...");

    if (developmentChains.includes(network.name)) {
        const mockPriceFeed = await ethers.getContract("MockV3Aggregator");
        priceFeedAddress = mockPriceFeed.address;
        const mockVRFCoordinator = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorAddress = mockVRFCoordinator.address;
        const transactionResponse = await mockVRFCoordinator.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        await mockVRFCoordinator.fundSubscription(subscriptionId, FUND_AMOUNT);
    } else {
        priceFeedAddress = networkConfig[network.name].BTCUSDPriceFeedAddress;
        vrfCoordinatorAddress = networkConfig[network.name].vrfCoordinatorAddress;
        subscriptionId = networkConfig[network.name].subscriptionId;
    }

    const interval = networkConfig[network.name].keepersUpdateInterval;
    const gasLane = networkConfig[network.name].gasLane;
    const callbackGasLimit = networkConfig[network.name].callbackGasLimit;

    const args = [
        interval,
        priceFeedAddress,
        vrfCoordinatorAddress,
        gasLane,
        subscriptionId,
        callbackGasLimit
    ];
    const bullBear = await deploy("BullBear", {
        from: accounts[0].address,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0
    });
    log(`BullBear deployed at ${bullBear.address}`);

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        const bullBearContract = await ethers.getContract("BullBear");
        vrfCoordinatorV2Mock.addConsumer(subscriptionId, bullBearContract.address);
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(bullBear.address, args);
    }
};

export default deployBullBear;
deployBullBear.tags = ["all", "bullBear"];
