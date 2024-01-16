const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const uniswapABI = require('./uniswap.json');

let owner;
let otherAccount;

const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const wbtcAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"; 
let tusdContract;
let engineContract;
let tusdAddress;
let engineAddress;

describe("TUSDContract", function () {
  
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployTUSDContract() {
    // Contracts are deployed using the first signer/account by default
    [owner, otherAccount] = await ethers.getSigners();
    console.log("OWNER ADDRESS", owner.address);
    const TusdContract = await ethers.getContractFactory("TUSD");
    const tusdContract = await TusdContract.deploy();
    return tusdContract;
  }

  async function deployEngineContract() {
    // Contracts are deployed using the first signer/account by default
    [owner, otherAccount] = await ethers.getSigners();
    console.log("OWNER ADDRESS", owner.address);
    const EngineContract = await ethers.getContractFactory("TUSDEngine");
    const engineContract = await EngineContract.deploy(tusdAddress,
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3");
    return engineContract;
  }

  describe("TUSD & Engine Contract", function () {
    it("Should deploy TUSD", async function () {
      tusdContract = await loadFixture(deployTUSDContract);
      expect(await tusdContract.owner()).to.equal(owner.address);
    });
    it("Should check mint function", async function () {
      const _amount = await ethers.parseUnits('10', 10);
      await tusdContract.mint(owner.address,_amount);
      expect(await tusdContract.balanceOf(owner.address)).to.equal(_amount);
      console.log("TUSD Address ", await tusdContract.target);
      tusdAddress = await tusdContract.target;
    });

    it("should deploy library", async function(){ 
      const oracleLib = await ethers.getContractFactory("OracleLib");
      const oracleLibInstance = await oracleLib.deploy();
    })

    it("Should deploy Engine", async function () {
      engineContract = await loadFixture(deployEngineContract);
      await hre.link("OracleiLib", await engineContract.target);
      expect(await tusdContract.owner()).to.equal(owner.address);
      console.log("Engine Address ", await engineContract.target);
      engineAddress = await engineContract.target;
    });

    it("Should transfer ownership of TUSD", async function() {
      await tusdContract.transferOwnership(engineAddress);
      expect(await tusdContract.owner()).to.equal(engineAddress);
    })


  });
});
