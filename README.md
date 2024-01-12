Tiger NFT ERC721

# The Tiger Clan

- [Install](#install)
- [Usage](#usage)

## Install

This project uses hardhat

```sh
$ npm i -j hardhat
$ npm i --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai @openzeppelin/contracts @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-truffle5
$ npm install --save-dev erc721a
```

## Usage

```sh
$ npx hardhat compile // Compile Code
$ npx hardhat node // Start localhost test accounts
$ npx hardhat test --localhost // Local Deployment & Testing
$ npx hardhat test scripts/NFT-deploy.js --network rinkeby  // RinkeBy Testnet Deployment
$ npx hardhat test scripts/NFT-deploy.js --network mainnet  // Main-net Deployment
$ npx hardhat verify --network goerli ContractAddress ConstructorArg1 ConstructorArg2 ....
```


```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
