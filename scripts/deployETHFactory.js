// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


async function deployETHFactory() {
  const ETHBorrow = await hre.ethers.getContractFactory("ETHBorrowFactory");
  let ethBorrow;
  console.log("ETHBorrowFactory factory created.");
  try{
      ethBorrow = await ETHBorrow.deploy();
  }
  catch (error) {
    console.error("Error deploying ETHBorrowFactory:", error);
    process.exit(1);
  }
  console.log("ETHBorrowFactory Contract Address", ethBorrow.target);
  return ethBorrow;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployETHFactory().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
