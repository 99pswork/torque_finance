// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
// 1 TORQ / Day for 2000 WBTC
//288000*2000*1000000000000000000000000/576000000000000 = 1 TORQ / DAY
// 1 TORQ / Day for 300000000000000 WETH
//288000*300000000000000*1000000000000000000000000/86400000000000000000000000
// 28800000000000000000000000
//39874999999999999
async function deployRewardsUtilContract() {

  const RewardsUtil = await hre.ethers.getContractFactory("RewardUtil");
  let rewardsUtil;
  console.log("Rewards Util factory created.");
  try{
    rewardsUtil = await RewardsUtil.deploy("0xb56C29413AF8778977093B9B4947efEeA7136C36","0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01");
  }
  catch (error) {
    console.error("Error deploying Rewards Util:", error.message);
    process.exit(1);
  }
  console.log("Rewards Util Contract Address", rewardsUtil.target);
  return rewardsUtil;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployRewardsUtilContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat verify --network arbitrum 0x1918C959c8a43A845ed08799DC22c1Ed7dAD1651 "0xb56C29413AF8778977093B9B4947efEeA7136C36" "0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01" 
