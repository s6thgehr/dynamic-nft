export interface networkConfigItem {
    blockConfirmations?: number;
    keepersUpdateInterval?: string;
    BTCUSDPriceFeedAddress?: string;
    decimals?: string;
    initialAnswer?: string;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    localhost: {
        keepersUpdateInterval: "30",
        decimals: "8",
        initialAnswer: "2000000000000"
    },
    hardhat: {
        keepersUpdateInterval: "30",
        decimals: "8",
        initialAnswer: "2000000000000"
    },
    goerli: {
        blockConfirmations: 6,
        keepersUpdateInterval: "86400",
        BTCUSDPriceFeedAddress: "0xA39434A63A52E749F02807ae27335515BA4b07F7"
    }
};

export const developmentChains = ["hardhat", "localhost"];
