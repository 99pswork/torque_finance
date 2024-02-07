const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const uniswapABI = require('./uniswap.json');
  
let ownerAddress;
let otherAccount;

describe("Uniswap", async function () {
    async function deployUniswapContract() {

        [owner, otherAccount] = await ethers.getSigners();
        console.log("OWNER ADDRESS", owner.address);
        ownerAddress = owner.address
        const UniswapBTC = await ethers.getContractFactory("UniswapBTC");
        console.log("Uniswap factory created.");
        let uniswap = await UniswapBTC.deploy("0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
            "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
            "0xe592427a0aece92de3edee1f18e0157c05861564",
            "0x0f773B3d518d0885DbF0ae304D87a718F68EEED5"); // // Pass constructor Arguments 
        console.log("UniSwap Contract Address",await uniswap.target);
        uniswapAddress = await uniswap.target;
        return uniswap;
    }

    describe("Deployment Basic Test", async function () {
        let uniswapbtc;
        it("Should deploy", async function () {
            uniswapbtc = await loadFixture(deployUniswapContract);
            expect(await uniswapbtc.owner()).to.equal(ownerAddress);
        });
    
        it("Should get WBTC & WETH", async function () {
          console.log("WBTC & WETH ", await uniswapbtc.calculateExpectedTokenAmounts(4841));
        });

        it("Should get WETH", async function () {
            console.log("WETH ", await uniswapbtc.convertValWbtcToWeth(2420));
            expect(await uniswapbtc.convertValWbtcToWeth(2420)).to.equal(2141);
          });
    });
})