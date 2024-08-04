// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostWBTCAddress;
// npx hardhat verify --network arbitrum 0x0D08442B2758a50aA8187D602bA8261C333d44B2 "Torque COMP" "tCOMP" "0x354a6da3fcde098f8389cad84b0182725c6c91de" "0x5b51feEB04E2381BB69d685BDAB480c4C29f9a43" "0x39054575e511bae354dBBF72d2B8Ce04C4780054" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"
async function deployBoostWBTCContract() {

  const BoostWBTC = await hre.ethers.getContractFactory("BoostCOMP");
  let boostWbtc;
  console.log("Boost COMP factory created.");
  try{
    boostWbtc = await BoostWBTC.deploy("Torque COMP",
    "tCOMP",
    "0x354a6da3fcde098f8389cad84b0182725c6c91de",
    "0x5b51feEB04E2381BB69d685BDAB480c4C29f9a43",
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

// Token factory created.
// Token Contract Address 0xf795e6c856835cFd3ac301D5F9f845add215EaB9
// Timelock factory created.
// Timelock Contract Address 0x240a50235a3A8C4fc9DDe95148fa538b86c68CC3
// Hamilton factory created.
// Hamilton Contract Address 0x9B030c24CC2DBcE14E0F14bdD67B29C73F64cD7b

// 0x0D08442B2758a50aA8187D602bA8261C333d44B2 "Torque COMP" "tCOMP" "0x354a6da3fcde098f8389cad84b0182725c6c91de" "0x5b51feEB04E2381BB69d685BDAB480c4C29f9a43" "0x177f6519A523EEbb542aed20320EFF9401bC47d0" "0x3452faA42fd613937dCd43E0f0cBf7d4205919c5"