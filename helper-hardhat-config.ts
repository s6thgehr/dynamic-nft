import { ethers } from "hardhat";

export interface networkConfigItem {
    blockConfirmations?: number;
    keepersUpdateInterval?: string;
    BTCUSDPriceFeedAddress?: string;
    decimals?: string;
    initialAnswer?: string;
    baseFee?: string;
    gasPriceLink?: string;
    vrfCoordinatorAddress?: string;
    gasLane?: string;
    callbackGasLimit?: string;
    subscriptionId?: string;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    localhost: {
        keepersUpdateInterval: "30",
        decimals: "8",
        initialAnswer: "2000000000000",
        baseFee: ethers.utils.parseEther("0.25").toString(), // i.e 0.25 Link
        gasPriceLink: "1000000000", // i.e 0.000000001 LINK per gas
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000"
    },
    hardhat: {
        keepersUpdateInterval: "30",
        decimals: "8",
        initialAnswer: "2000000000000",
        baseFee: ethers.utils.parseEther("0.25").toString(), // i.e 0.25 Link
        gasPriceLink: "1000000000", // i.e 0.000000001 LINK per gas
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000"
    },
    goerli: {
        blockConfirmations: 6,
        keepersUpdateInterval: "86400",
        BTCUSDPriceFeedAddress: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
        baseFee: ethers.utils.parseEther("0.25").toString(), // i.e 0.25 Link
        gasPriceLink: "1000000000", // i.e 0.000000001 LINK per gas
        vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        subscriptionId: "0"
    }
};

export const developmentChains = ["hardhat", "localhost"];
