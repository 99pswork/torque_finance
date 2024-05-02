// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


async function deploySimpleBTCFactory() {
  const BTCBorrow = await hre.ethers.getContractFactory("SimpleBTCBorrowFactory");
  let btcBorrow;
  console.log("SimpleBTCBorrowFactory factory created.");
  try{
      btcBorrow = await BTCBorrow.deploy();
  }
  catch (error) {
    console.error("Error deploying SimpleBTCBorrowFactory:", error);
    process.exit(1);
  }
  console.log("SimpleBTCBorrowFactory Contract Address", btcBorrow.target);
  return btcBorrow;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploySimpleBTCFactory().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
