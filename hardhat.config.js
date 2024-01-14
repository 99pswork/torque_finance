require("@nomicfoundation/hardhat-toolbox");
const CONFIG = require("./credentials.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: CONFIG["Mainnet_ARB"], // Replace with your Alchemy API key
      },
    },
  },
  etherscan: {
    apiKey: CONFIG["API_KEY"],
  },
  namedAccounts: {
    deployer: {
      default: 0, // index of the account in the ethers.getSigners() array
    },
  },
};
