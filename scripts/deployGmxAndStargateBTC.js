// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let gmxwbtcAddress;
let uniswapAddress;
async function deployGMXV2WBTCContract() {

  const GMXWBTC = await hre.ethers.getContractFactory("GMXV2BTC");
  let gmxWbtc;
  console.log("GMX V2 WBTC factory created.");
  try{
    gmxWbtc = await GMXWBTC.deploy("0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    "0x47c031236e19d024b42f8AE6780E44A573170703",
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
  console.log("GMX V2 BTC Address", gmxWbtc.target);
  gmxwbtcAddress = gmxWbtc.target;

  deployUniswapContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}

async function deployUniswapContract() {

    const UniSwap = await hre.ethers.getContractFactory("UniswapBTC");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"); // // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying UniSwap:", error.message);
      process.exit(1);
    }
    console.log("UniSwap Contract Address",await uniswap.target);
    uniswapAddress = await uniswap.target;

}

deployGMXV2WBTCContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// 0x02eBDE50016fba5d140342E37c7ebe41fDCbc622 "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0x47c031236e19d024b42f8AE6780E44A573170703" "0xaf88d065e77c8cc2239327c5edb3a432268e5831" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8" "0xe592427a0aece92de3edee1f18e0157c05861564" "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55" "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55" "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"

// 0xe070D2f1cb63039F4D0e012AFDa875cB10fd4953 "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"