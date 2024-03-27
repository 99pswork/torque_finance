// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// npx hardhat verify --network arbitrum 0x3B7cEF8320F0F3aF601eD33D0cC39a68b2fB37cA "0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01" "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf" "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae" "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" "0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d" "0x867bF0476655Cf05934869B449a0be0ED534eA60" "0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5" "0x36A04745c615722f369b2Fd2B3F719f1a611F7cA" 1 
async function deployBorrowETHContract() {

  const ETHBorrow = await hre.ethers.getContractFactory("ETHBorrow");
  let ethBorrow;
  console.log("ETHBorrow factory created.");
  try{
      ethBorrow = await ETHBorrow.deploy("0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01", 
    "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf", 
    "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae", 
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d",
    "0xfdf7b4486f5de843838EcFd254711E06aF1f0641",
    "0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68",
    "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5",
    "0x36A04745c615722f369b2Fd2B3F719f1a611F7cA",
    1);
  }
  catch (error) {
    console.error("Error deploying ETHBorrow:", error.message);
    process.exit(1);
  }
  console.log("ETH Borrow Contract Address", ethBorrow.target);
  return ethBorrow;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployBorrowETHContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
