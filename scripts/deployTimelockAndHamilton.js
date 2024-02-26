// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let timelockAddress;
async function deployTimelockAndHamiltonContract() {

  const TimeLock = await hre.ethers.getContractFactory("Timelock");
  let timelock;
  console.log("Timelock factory created.");
  try{
    timelock = await TimeLock.deploy("0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01", 432000); // Pass constructor Arguments 
  }
  catch (error) {
    console.error("Error deploying Timelock:", error.message);
    process.exit(1);
  }
  console.log("Timelock Address", timelock.target);
  timelockAddress = timelock.target;

  deployHamiltonContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  
}

async function deployHamiltonContract() {

    const Hamilton = await hre.ethers.getContractFactory("Hamilton");
    let hamilton;
    console.log("Hamilton factory created.");
    try{
        hamilton = await Hamilton.deploy("0xb56C29413AF8778977093B9B4947efEeA7136C36", timelockAddress); // // Pass constructor Arguments 
    }
    catch (error) {
      console.error("Error deploying Hamilton:", error.message);
      process.exit(1);
    }
    console.log("Hamilton Address",await hamilton.target);
}

deployTimelockAndHamiltonContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// npx hardhat verify --network arbitrum 0x78112179F84357B55Db265Bcabb8c9c6f1CcB850 "0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01" "432000"

// npx hardhat verify --network arbitrum 0x43F726347b5C56325e116b92cc846C3cF50F16c7 "0xb56C29413AF8778977093B9B4947efEeA7136C36" "0x78112179F84357B55Db265Bcabb8c9c6f1CcB850"