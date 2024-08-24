// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");


async function deploySimpleETHFactory() {
  const ETHBorrow = await hre.ethers.getContractFactory("AaveWbtcRefinance");
  let ethBorrow;
  console.log("AaveWbtcRefinance factory created.");
  try{
      ethBorrow = await ETHBorrow.deploy();
  }
  catch (error) {
    console.error("Error deploying AaveWbtcRefinance:", error);
    process.exit(1);
  }
  console.log("AaveWbtcRefinance Contract Address", ethBorrow.target);
  return ethBorrow;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploySimpleETHFactory().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Factory contract verification 
// npx hardhat verify --network arbitrum  0x2D7D3f47827f704d66B25E69953b7f2bEa61a62C "0x7fb3933a47D20ab591D4F136E36865576c6f305c" "0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf" "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae" "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" "0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5" "0xDd0E807e17843C12387e99964E5Cf0C39B42f79a" 1
