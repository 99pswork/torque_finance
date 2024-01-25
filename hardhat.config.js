require("@nomicfoundation/hardhat-toolbox");
const CONFIG = require("./credentials.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Adjust the number of runs as needed
      },
    },
  },
  networks: {
    arbitrum: {
			url: CONFIG["Mainnet_ARB"],
			accounts: [CONFIG["PKEY"]],
		},
    goerli: {
			url: CONFIG["GOERLI"]["URL"],
			accounts: [CONFIG["GOERLI"]["PKEY"]],
		},
    hardhat: {
      forking: {
        url: CONFIG["Mainnet_ARB"], // Replace with your Alchemy API key
      },
    },
  },
  etherscan: {
    apiKey: CONFIG["ARB_KEY"],
  },
  namedAccounts: {
    deployer: {
      default: 0, // index of the account in the ethers.getSigners() array
    },
  },
  sourcify: {
    enabled: true
  },
  spdxLicenseIdentifier: {
		overwrite: true,
		runOnCompile: true,
	},
  contractSizer: {
		alphaSort: false,
		runOnCompile: true,
		disambiguatePaths: false,
	},
};
