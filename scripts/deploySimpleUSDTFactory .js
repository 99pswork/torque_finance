// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


async function deploySimpleETHBorrowUSDTFactory() {
  const USDTBorrow = await hre.ethers.getContractFactory("SimpleETHBorrowUSDTFactory");
  let usdtBorrow;
  console.log("SimpleETHBorrowUSDTFactory factory created.");
  try{
    usdtBorrow = await USDTBorrow.deploy();
  }
  catch (error) {
    console.error("Error deploying SimpleETHBorrowUSDTFactory:", error);
    process.exit(1);
  }
  console.log("SimpleETHBorrowUSDTFactory Contract Address", usdtBorrow.target);
  return usdtBorrow;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploySimpleETHBorrowUSDTFactory().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
