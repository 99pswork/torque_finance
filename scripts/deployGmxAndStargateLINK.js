// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
 
const hre = require("hardhat");
let gmxLinkAddress;
let uniswapAddress;

async function deployGMXV2LinkContract() {

  const GMXLINK = await hre.ethers.getContractFactory("GMXV2LINK");
  let gmxLink;
  console.log("GMX V2 Link factory created.");
  try{
    gmxLink = await GMXLINK.deploy("0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    "0x7f1fa204bb700853D36994DA19F830b6Ad18455C",
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "0x912ce59144191c1204e64559fe8253a0e49e6548",
    "0x69C527fC77291722b52649E45c838e41be8Bf5d5",
    "0xe592427a0aece92de3edee1f18e0157c05861564",
    "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
    "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
    "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6");// Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying GMX V2:", error.message);
    process.exit(1);
  }
  console.log("GMX V2 Link Address", gmxLink.target);
  gmxLinkAddress = gmxLink.target;

  deployUniswapContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}

async function deployUniswapContract() {

    const UniSwap = await hre.ethers.getContractFactory("UniswapLINK");
    let uniswap;
    console.log("Uniswap factory created.");
    try{
      uniswap = await UniSwap.deploy("0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0x177f6519A523EEbb542aed20320EFF9401bC47d0"); // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying UniSwap:", error.message);
      process.exit(1);
    }
    console.log("UniSwap Contract Address",await uniswap.target);
    uniswapAddress = await uniswap.target;

}

deployGMXV2LinkContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat verify --network arbitrum 0xbBdd2226AE13dbcc821f1fecE1E8aaF1587a9c99 "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0x7f1fa204bb700853D36994DA19F830b6Ad18455C" "0xaf88d065e77c8cc2239327c5edb3a432268e5831" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0x69C527fC77291722b52649E45c838e41be8Bf5d5" "0xe592427a0aece92de3edee1f18e0157c05861564" "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55" "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55" "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"

// npx hardhat verify --network arbitrum 0x632A7F510985173B20Bc9a599e51853D163bAE18 "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4" "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0xC36442b4a4522E871399CD717aBDD847Ab11FE88" "0xe592427a0aece92de3edee1f18e0157c05861564" "0x177f6519A523EEbb542aed20320EFF9401bC47d0"
