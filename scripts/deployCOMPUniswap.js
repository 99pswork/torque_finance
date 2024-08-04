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

    const UniSwap = await hre.ethers.getContractFactory("UniswapCOMP");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0x354A6dA3fcde098F8389cad84b0182725c6C91dE",
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


// 0xf4A597B9879b091270A9F4c07022ee7857A56A70 "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0x47c031236e19d024b42f8AE6780E44A573170703" "0xaf88d065e77c8cc2239327c5edb3a432268e5831" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0x69C527fC77291722b52649E45c838e41be8Bf5d5" "0xe592427a0aece92de3edee1f18e0157c05861564" "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55" "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55" "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"

// 0xD579761528ac263b50a81FCEdcfB6Aa4ae4e64e6 "0x354A6dA3fcde098F8389cad84b0182725c6C91dE" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x177f6519A523EEbb542aed20320EFF9401bC47d0"


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