require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require('hardhat-deploy');


const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ;
const PRIVATE_KEY =
  process.env.PRIVATE_KEY;
  const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  // solidity: "0.8.18",
  solidity: {
    compilers: [
        {
            version: "0.8.7",
        },
        {
            version: "0.6.6",
        },
        {
          version: "0.8.18",
      },
    ],
},
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 11155111,
      blockConfirmations: 6
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    },
},
  
};
