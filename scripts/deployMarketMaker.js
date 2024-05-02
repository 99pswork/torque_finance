// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function deployMarketMaker() {
    const MarketMaker = await hre.ethers.getContractFactory("MarketMaker");
    let marketMaker;
    console.log("MarketMaker factory created.");
    try{
      marketMaker = await MarketMaker.deploy();
    }
    catch (error) {
      console.error("Error deploying MarketMaker:", error);
      process.exit(1);
    }
    console.log("MarketMaker Contract Address", marketMaker.target);
    return marketMaker;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployMarketMaker().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
