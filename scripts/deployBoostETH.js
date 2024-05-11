// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostETHAddress;

// npx hardhat verify --network arbitrum 0x36Ac52C415042Fbc6D7564f4ad1410094f214f92 "Torque ETH" "tETH" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xd698D5F734E6be707B33f452A840BA56159A81aD" "0x523823e1FAb8A853E355b927589d75f000dbA7a9" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4"
async function deployBoostETHContract() {

  const BoostETH = await hre.ethers.getContractFactory("BoostETH");
  let boostETH;
  console.log("Boost ETH factory created.");
  try{
    boostETH = await BoostETH.deploy("Torque ETH",
    "tETH",
    "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0xd698D5F734E6be707B33f452A840BA56159A81aD",
    "0x523823e1FAb8A853E355b927589d75f000dbA7a9",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    "0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4"); // Pass constructor Arguments 
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