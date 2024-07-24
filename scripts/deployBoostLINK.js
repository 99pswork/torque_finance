// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostLINKAddress;
// npx hardhat verify --network arbitrum 0xb149266F2AdaF5f3b203997e9a4626e55667DAbB "Torque LINK" "tLINK" "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0xA837Fa02444bF9c4b32B9719B5078EAcbB0aE19B" "0x3C9f47CADb2f54D13B4eE5F18C3B13910B2aE0cA" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4"

async function deployBoostLinkContract() {

  const BoostLink = await hre.ethers.getContractFactory("BoostLINK");
  let boostLink;
  console.log("Boost LINK factory created.");
  try{
    boostLink = await BoostLink.deploy("Torque LINK",
    "tLINK",
    "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    "0xA837Fa02444bF9c4b32B9719B5078EAcbB0aE19B",
    "0x3C9f47CADb2f54D13B4eE5F18C3B13910B2aE0cA",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    "0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4"); // Pass constructor Arguments 
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


// npx hardhat verify --network arbitrum 0xE8CCFa1b4Fe3Dd66aec675c6Af51D8245a7C9EA4 "Torque LINK" "tLINK" "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0xB9A4210Fb885300EB96e6D7c6993C94BE3066A3C" "0x632A7F510985173B20Bc9a599e51853D163bAE18" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4"
