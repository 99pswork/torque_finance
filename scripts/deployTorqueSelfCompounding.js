// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

// - WBTC/WETH, SWAP FEE 3000
// - USDC/WETH, SWAP FEE 3000
// - USDC/TUSD, SWAP FEE 100
// - TORQ/WETH, SWAP FEE 3000


const hre = require("hardhat");
// npx hardhat verify --network arbitrum 0xcE0C0E633086E4Bd3B2b4298D16b504490534411 "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
async function deployTorqueSelfCompoundor() {

  const SwapTorque = await hre.ethers.getContractFactory("TorqueSelfCompoundor");
  let swapTorque;
  console.log("Torque compounding factory created.");
  try{
    swapTorque = await SwapTorque.deploy("0xC36442b4a4522E871399CD717aBDD847Ab11FE88", "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45");
  }
  catch (error) {
    console.error("Error deploying Torque Compounder:", error);
    process.exit(1);
  }
  console.log("Torque Compounder: Contract Address", swapTorque.target);
  return swapTorque;
}

// We recommend this pattern to be able to use async/await everywhere

deploySwapTorqueToken().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
