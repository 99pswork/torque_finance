require("@nomicfoundation/hardhat-toolbox");
const CONFIG = require("./credentials.json");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    arbitrum: {
			url: CONFIG["Mainnet_ARB"],
			accounts: [CONFIG["PKEY"]],
		},
    goerli: {
			url: CONFIG["RINKEBY"]["URL"],
			accounts: [CONFIG["RINKEBY"]["PKEY"]],
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
