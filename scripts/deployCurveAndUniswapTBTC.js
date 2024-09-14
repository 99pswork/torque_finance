// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let uniswapAddress;
async function deployCurveWBTCContract() {

  const CurveBTC = await hre.ethers.getContractFactory("CurveTBTC");
  let curveWbtc;
  console.log("CurveTBTC WBTC factory created.");
  try{
    curveWbtc = await CurveBTC.deploy(); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying CurveTBTC:", error.message);
    process.exit(1);
  }
  console.log("CurveTBTC Address", curveWbtc.target);

  deployUniswapContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}

async function deployUniswapContract() {

    const UniSwap = await hre.ethers.getContractFactory("UniswapTBTC");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40",
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0x177f6519A523EEbb542aed20320EFF9401bC47d0"); // // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying UniSwap:", error.message);
      process.exit(1);
    }
    console.log("UniSwap Contract Address",await uniswap.target);
    uniswapAddress = await uniswap.target;

}

deployCurveWBTCContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat verify --network arbitrum 0x04505FF86BAa18105fD070155a75BB6a9d9A8CE9 "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x177f6519A523EEbb542aed20320EFF9401bC47d0"
