// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
let tokenAddress;
let timeLockAddress;
async function deployTokenContract() {

  const Token = await hre.ethers.getContractFactory("Token");
  let token;
  console.log("Token factory created.");
  try{
    token = await Token.deploy("TestTQ","TQ");
  }
  catch (error) {
    console.error("Error deploying Token:", error.message);
    process.exit(1);
  }
  console.log("Token Contract Address", token.target);
  tokenAddress = token.target;
  
  deployTimelockContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
}

async function deployTimelockContract() {

    const Timelock = await hre.ethers.getContractFactory("Timelock");
    let timelock;
    console.log("Timelock factory created.");
    try{
        timelock = await Timelock.deploy("0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01",300);
    }
    catch (error) {
      console.error("Error deploying Timelock:", error.message);
      process.exit(1);
    }
    console.log("Timelock Contract Address",await timelock.target);
    timeLockAddress = await timelock.target;

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
        hamilton = await Hamilton.deploy(tokenAddress,timeLockAddress);
    }
    catch (error) {
      console.error("Error deploying Hamilton:", error.message);
      process.exit(1);
    }
    console.log("Hamilton Contract Address", hamilton.target);
    return token;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployTokenContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


// Token factory created.
// Token Contract Address 0xf795e6c856835cFd3ac301D5F9f845add215EaB9
// Timelock factory created.
// Timelock Contract Address 0x240a50235a3A8C4fc9DDe95148fa538b86c68CC3
// Hamilton factory created.
// Hamilton Contract Address 0x9B030c24CC2DBcE14E0F14bdD67B29C73F64cD7b