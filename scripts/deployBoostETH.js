// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostETHAddress;

// npx hardhat verify --network arbitrum 0x261d07bE7ef781799472911BC8866052E833e121 "Torque ETH" "tETH" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xa0991eDF5964285509e9e36C798Dc44bF92842c8" "0xF1221ee15Eae644e8d449709333b54c624301c67" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"
async function deployBoostETHContract() {

  const BoostETH = await hre.ethers.getContractFactory("BoostETH");
  let boostETH;
  console.log("Boost ETH factory created.");
  try{
    boostETH = await BoostETH.deploy("Torque ETH",
    "tETH",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0xa0991eDF5964285509e9e36C798Dc44bF92842c8",
    "0xF1221ee15Eae644e8d449709333b54c624301c67",
    "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"); // Pass constructor Arguments 
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