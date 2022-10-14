import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-deploy";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545/"
        },
        goerli: {
            chainId: 5,
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY
    }
};

export default config;
