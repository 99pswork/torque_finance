// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let gmxUniAddress;
let uniswapAddress;
async function deployGMXV2UNIContract() {

  const GMXUNI = await hre.ethers.getContractFactory("GMXV2UNI");
  let gmxUni;
  console.log("GMX V2 UNI factory created.");
  try{
    gmxUni = await GMXUNI.deploy("0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    "0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50",
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "0x912ce59144191c1204e64559fe8253a0e49e6548",
    "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8",
    "0xe592427a0aece92de3edee1f18e0157c05861564",
    "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
    "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
    "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying GMX V2:", error.message);
    process.exit(1);
  }
  console.log("GMX V2 UNI Address", gmxUni.target);
  gmxUniAddress = gmxUni.target;

  deployUniswapContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}

async function deployUniswapContract() {

    const UniSwap = await hre.ethers.getContractFactory("UniswapUNI");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"); // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying UniSwap:", error.message);
      process.exit(1);
    }
    console.log("UniSwap Contract Address",await uniswap.target);
    uniswapAddress = await uniswap.target;

}

deployGMXV2UNIContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// 0x82927257fAdB173AB78402D091c1080aA89fF6E4 "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0" "0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50" "0xaf88d065e77c8cc2239327c5edb3a432268e5831" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8" "0xe592427a0aece92de3edee1f18e0157c05861564" "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55" "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55" "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"

// 0x5AC0240c9ABfE3a891af8eE565f1FDE2A7706981 "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"


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