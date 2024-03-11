// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostETHAddress;

// npx hardhat verify --network arbitrum 0x18ab2e5cE4D0b75E6353B62085CBb6122ef8586B "Torque ETH" "tETH" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0x0E496B2C4003bE8f7424e4d5c1535C86bB847898" "0x60ac7FA9Bf6b1ac1bEff18FF62F24adE62B697eC" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x36A04745c615722f369b2Fd2B3F719f1a611F7cA"
async function deployBoostETHContract() {

  const BoostETH = await hre.ethers.getContractFactory("BoostETH");
  let boostETH;
  console.log("Boost ETH factory created.");
  try{
    boostETH = await BoostETH.deploy("Torque ETH",
    "tETH",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0x0E496B2C4003bE8f7424e4d5c1535C86bB847898",
    "0x60ac7FA9Bf6b1ac1bEff18FF62F24adE62B697eC",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    "0x36A04745c615722f369b2Fd2B3F719f1a611F7cA"); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying Boost ETH:", error.message);
    process.exit(1);
  }
  console.log("Boost ETH ETH Address", boostETH.target);
  boostETHAddress = boostETH.target;
  
}

deployBoostETHContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Token factory created.
// Token Contract Address 0xf795e6c856835cFd3ac301D5F9f845add215EaB9
// Timelock factory created.
// Timelock Contract Address 0x240a50235a3A8C4fc9DDe95148fa538b86c68CC3
// Hamilton factory created.
// Hamilton Contract Address 0x9B030c24CC2DBcE14E0F14bdD67B29C73F64cD7b