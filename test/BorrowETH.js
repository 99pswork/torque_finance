const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const uniswapABI = require('./uniswap.json');

let owner;
let otherAccount;
let decimalAdjust;
const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const wbtcAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"; 

describe("ETHBorrow", function () {
  
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBorrowETHContract() {
    // Contracts are deployed using the first signer/account by default
    [owner, otherAccount] = await ethers.getSigners();
    console.log("OWNER ADDRESS", owner.address);
    const ETHBorrow = await ethers.getContractFactory("ETHBorrow");
    const ethBorrow = await ETHBorrow.deploy(owner.address, 
    "0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf", 
    "0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae", 
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d",
    "0x867bF0476655Cf05934869B449a0be0ED534eA60",
    "0xf7F6718Cf69967203740cCb431F6bDBff1E0FB68",
    "0x177f6519A523EEbb542aed20320EFF9401bC47d0",
    1);
    console.log("ETH Borrow Contract Address", ethBorrow.target);
    decimalAdjust = await ethers.parseUnits('10', 11);
    return ethBorrow;
  }

  describe("Deployment Basic Test", function () {
    let ethBorrow;
    it("Should deploy", async function () {
      ethBorrow = await loadFixture(deployBorrowETHContract);
      expect(await ethBorrow.owner()).to.equal(owner.address);
    });

    // it("Should get 98% of USDC values", async function () {
    //   const usdcSupply = 2000000;
    //   console.log("MINTABLE TUSD ", await ethBorrow.getMintableToken(owner,usdcSupply));
    //   expect(await ethBorrow.getMintableToken(owner,usdcSupply)).to.equal(BigInt(usdcSupply)*BigInt(98)*decimalAdjust/BigInt(100));
    // });

    it('Should get WETH Address', async function(){
      console.log("WETH Address ", await ethBorrow.getAsset());
    })

    it("Should get 100% of USDC values when burning", async function () {
      console.log("BURNABLE TOKEN ", await ethBorrow.getBurnableToken(BigInt(980000000000000000), BigInt(980000000000000000), BigInt(1000000)));
    });


    it("Should get borrowable usdc", async function () {
      // console.log("TEST ASSET ", await ethBorrow.asset);
      console.log("TEST Borrowable USDC", await ethBorrow.getBorrowableUsdc(BigInt(1047040471627971)));
      // console.log("TEST Borrowable USDC for 25000 WBTC", await ethBorrow.getBorrowableUsdc(25000));
      expect(await ethBorrow.getBorrowableUsdc(100000000)).to.not.equal(BigInt(0));
    });

    it("Should get collateral factor from coment", async function() {
      console.log("TEST Collateral Factor ", await ethBorrow.getCollateralFactor());
      expect(await ethBorrow.getCollateralFactor()).to.not.equal(0);
    })

    it("Should get error when checking for borrow", async function() {
      expect(await ethBorrow.getUserBorrowable(owner.address)).to.equal(0);
    })
    
    it("Should get error when withdrawing funds without supply", async function() {
      await expect(ethBorrow.withdraw(1)).to.be.revertedWith("User does not have asset");
    })

    it("Should borrowed amount return 0 intially", async function() {
      expect(await ethBorrow.getTotalAmountBorrowed(owner.address)).to.equal(0);
    })
    
    it("Should supplied amount return 0 intially", async function() {
      expect(await ethBorrow.getTotalAmountSupplied(owner.address)).to.equal(0);
    })

    it("Should supplied 1WBTC get TUSD", async function() {
      console.log(await ethBorrow.mintableTUSD(100000000));
    })

  // describe("Swap tokens and test", function () {
    // it("Should borrow TUSD for supply of 1WBTC ", async function() {
    //   try{
    //     const uniswapRouter = new ethers.Contract(uniswapRouterAddress, ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'], owner);
    //     const amountOutMin = 1;
    //     const path = ["0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", wbtcAddress];
    //     const to = owner.address;
    //     const deadline = Math.floor(Date.now() / 1000) + 60000;
    //     const weiValue = await ethers.parseUnits('10', 18);
    //     const result = await uniswapRouter.swapExactETHForTokens(amountOutMin, path, to, deadline, {value: weiValue});
    //     const receipt = await result.wait();
    //     console.log("Transaction Receipt:", receipt);
    //     console.log("Swap Result: ", result);
    //     console.log("TEST ", deadline);
    //   }
    //   catch (error) {
    //     console.error("Error:", error.message || error.reason || error.toString());
    //   }
    // })

    // it("Should swap ETH for 1WBTC ", async function() {
    //   try{
    //     const weiValue = await ethers.parseUnits('10', 18);
    //     const result = await btcBorrow.swapEth({value: weiValue});
    //     console.log("Swap Result: ", result);
    //   }
    //   catch (error) {
    //     console.error("Error:", error.message || error.reason || error.toString());
    //   }
    // })
  });
});
