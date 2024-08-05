// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let gmxwbtcAddress;
let uniswapAddress;

async function deployUniswapContract() {

    const UniSwap = await hre.ethers.getContractFactory("UniswapTORQ");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0xb56C29413AF8778977093B9B4947efEeA7136C36",
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
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

deployUniswapContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0x807182a3a135c723b426FCCCbBE01d0e008D168b "0xb56C29413AF8778977093B9B4947efEeA7136C36" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x177f6519A523EEbb542aed20320EFF9401bC47d0"


// PS CHECK
// struct MarketPoolValueInfoProps {
//     int256 poolValue; 30297859937182975781353382593557078314
//     int256 longPnl; -30256194486684016933915089809167659866
//     int256 shortPnl; 57958940031103509964560000000000
//     int256 netPnl; -30256136527743985830405125249167659866

//     uint256 longTokenAmount; 177282026099
//     uint256 shortTokenAmount; 72438845087601
//     uint256 longTokenUsd; 7621624829125607562252570000000000
//     uint256 shortTokenUsd; 72448675038879387455700000000000

//     uint256 totalBorrowingFees; 54014820524637842323983133951457854
//     uint256 borrowingFeePoolFactor; 630000000000000000000000000000n

//     uint256 impactPoolAmount; 995561279n
//   }117473871830231827571983404