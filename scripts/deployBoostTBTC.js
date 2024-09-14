// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostWBTCAddress;

async function deployBoostWBTCContract() {

  const BoostWBTC = await hre.ethers.getContractFactory("BoostTBTC");
  let boostWbtc;
  console.log("Boost TBTC factory created.");
  try{
    boostWbtc = await BoostWBTC.deploy("Torque TBTC",
    "tBTC",
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "0xF0511c7c614EB19FE749B1CF9Bb4B2F8AaEC2B5E",
    "0x04505FF86BAa18105fD070155a75BB6a9d9A8CE9",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying Boost WBTC:", error.message);
    process.exit(1);
  }
  console.log("Boost WBTC Address", boostWbtc.target);
  boostWBTCAddress = boostWbtc.target;
  
}

deployBoostWBTCContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat verify --network arbitrum 0xbaa7B01aA47bBDb5d09410f105b2A96cEA9a9E2a "Torque TBTC" "tBTC" "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0xF0511c7c614EB19FE749B1CF9Bb4B2F8AaEC2B5E" "0x04505FF86BAa18105fD070155a75BB6a9d9A8CE9" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"