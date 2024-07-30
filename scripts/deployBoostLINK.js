// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostLINKAddress;
// npx hardhat verify --network arbitrum 0x6030A3E17377dBc2f9a15A1250FD8E1b0d49f2D3 "Torque LINK" "tLINK" "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0x6735D25182E77257eC54e663BaF641E0D6449f62" "0xfa7c469C549724cFE3F2C563136B51Fc7d9aF504" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"

async function deployBoostLinkContract() {

  const BoostLink = await hre.ethers.getContractFactory("BoostLINK");
  let boostLink;
  console.log("Boost LINK factory created.");
  try{
    boostLink = await BoostLink.deploy("Torque LINK",
    "tLINK",
    "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    "0x6735D25182E77257eC54e663BaF641E0D6449f62",
    "0xfa7c469C549724cFE3F2C563136B51Fc7d9aF504",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying Boost LINK:", error.message);
    process.exit(1);
  }
  console.log("Boost LINK Address", boostLink.target);
  boostLINKAddress = boostLink.target;
  
}


deployBoostLinkContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat verify --network arbitrum 0xE8CCFa1b4Fe3Dd66aec675c6Af51D8245a7C9EA4 "Torque LINK" "tLINK" "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0xB9A4210Fb885300EB96e6D7c6993C94BE3066A3C" "0x632A7F510985173B20Bc9a599e51853D163bAE18" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"
