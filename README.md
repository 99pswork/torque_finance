# The Torque Project

- [Install](#install)
- [Usage](#usage)

## Install

This project uses hardhat

```sh
$ npm i -j hardhat
$ npm i --save-dev @chainlink/contracts @openzeppelin/contracts
```

## Usage

```sh
$ npx hardhat compile // Compile Code
$ npx hardhat node // Start localhost test accounts
$ npx hardhat run --localhost // Local Deployment & Testing
$ npx hardhat run scripts/deploy.js --network goerli  // RinkeBy Testnet Deployment
$ npx hardhat run scripts/deploy.js --network mainnet  // Main-net Deployment
$ npx hardhat verify --network goerli ContractAddress ConstructorArg1 ConstructorArg2 ....
```


```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```
