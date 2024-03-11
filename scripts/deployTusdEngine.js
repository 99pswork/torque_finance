// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function deployTusdEngineContract() {

  const TusdEngine = await hre.ethers.getContractFactory("TUSDEngine");
  let tusdEngine;
  console.log("Tusd Engine factory created.");
  try{
    tusdEngine = await TusdEngine.deploy("0xaf88d065e77c8cC2239327C5EDb3A432268e5831","0x50834f3163758fcc1df9973b6e91f0f0f0434ad3", "0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68");
  }
  catch (error) {
    console.error("Error deploying TUSD Engine:", error.message);
    process.exit(1);
  }
  console.log("TUSD Engine Contract Address", tusdEngine.target);
  return tusdEngine;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployTusdEngineContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx hardhat verify --network arbitrum 0xfdf7b4486f5de843838EcFd254711E06aF1f0641 "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3" "0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68"