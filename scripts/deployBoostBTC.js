// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let boostWBTCAddress;

// npx hardhat verify --network arbitrum 0xDE80Cc9724FfAD03C2626379f22718527bB74b68 "Torque ETH" "tETH" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0x7A62C9192Ef422a2B365164bbF874e2D30F78300" "0xb2714778Db9CA01F677Af15A559D2E9C54970e6b" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"
async function deployBoostWBTCContract() {

  const BoostWBTC = await hre.ethers.getContractFactory("BoostBTC");
  let boostWbtc;
  console.log("Boost WBTC factory created.");
  try{
    boostWbtc = await BoostWBTC.deploy("Torque BTC",
    "tBTC",
    "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "0x1af712943B1C6B9c1d912cd40c121a3Ebc6055D6",
    "0xEE5eFB6C1CbA451FEC3e2e8530BF1799b3053354",
    "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"); // Pass constructor Arguments 
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

// 0xc5C2a3AEAeB09285F7f7c62885129966AE639Bf5 "Torque BTC" "tBTC" "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0x1af712943B1C6B9c1d912cd40c121a3Ebc6055D6" "0xEE5eFB6C1CbA451FEC3e2e8530BF1799b3053354" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"