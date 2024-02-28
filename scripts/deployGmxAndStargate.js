// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let gmxEthAddress;
let stargateAddress;
async function deployGMXV2ETHContract() {

  const GMXETH = await hre.ethers.getContractFactory("GMXV2ETH");
  let gmxEth;
  console.log("GMX V2 ETH factory created.");
  try{
    gmxEth = await GMXETH.deploy("0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "0x70d95587d40a2caf56bd97485ab3eec10bee6336",
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
  console.log("GMX V2 ETH Address", gmxEth.target);
  gmxEthAddress = gmxEth.target;

  deployStarGateContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}
// npx hardhat verify --network arbitrum 0x6d48D87e0Ee8Eb9E3F30B17E53dE7549b5CA99EA "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0x70d95587d40a2caf56bd97485ab3eec10bee6336" "0xaf88d065e77c8cc2239327c5edb3a432268e5831" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8" "0xe592427a0aece92de3edee1f18e0157c05861564" "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55" "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55" "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6"
// npx hardhat verify --network arbitrum 0xbe9C98F9ECA74B3EA6b09F9D95BB8aE4b4C937dF "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" "0x915a55e36a01285a14f05de6e81ed9ce89772f8e" "0x912ce59144191c1204e64559fe8253a0e49e6548" "0xbf22f0f184bccbea268df387a49ff5238dd23e40" "0x9774558534036ff2e236331546691b4eb70594b1" "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614" "0xe592427a0aece92de3edee1f18e0157c05861564"
async function deployStarGateContract() {

    const StarGate = await hre.ethers.getContractFactory("StargateETH");
    let stargate;
    console.log("StarGate factory created.");
    try{
      stargate = await StarGate.deploy("0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "0x915a55e36a01285a14f05de6e81ed9ce89772f8e",
      "0x912ce59144191c1204e64559fe8253a0e49e6548",
      "0xbf22f0f184bccbea268df387a49ff5238dd23e40",
      "0x9774558534036ff2e236331546691b4eb70594b1",
      "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614",
      "0xe592427a0aece92de3edee1f18e0157c05861564"); // // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying StarGate:", error.message);
      process.exit(1);
    }
    console.log("StarGate Contract Address",await stargate.target);
    stargateAddress = await stargate.target;

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployGMXV2ETHContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// Token factory created.
// Token Contract Address 0xf795e6c856835cFd3ac301D5F9f845add215EaB9
// Timelock factory created.
// Timelock Contract Address 0x240a50235a3A8C4fc9DDe95148fa538b86c68CC3
// Hamilton factory created.
// Hamilton Contract Address 0x9B030c24CC2DBcE14E0F14bdD67B29C73F64cD7b