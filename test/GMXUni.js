const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const uniswapABI = require('./uniswap.json');
   
  describe("GMXBTC", function () {
    
    async function deployGMXUNIContract() {
      // Contracts are deployed using the first signer/account by default
      [owner, otherAccount] = await ethers.getSigners();
      console.log("OWNER ADDRESS", owner.address);
      const GMXUNI = await ethers.getContractFactory("GMXV2UNI");
      const gmxUni = await GMXUNI.deploy("0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
      "0xc7Abb2C5f3BF3CEB389dF0Eecd6120D451170B50",
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "0x912ce59144191c1204e64559fe8253a0e49e6548",
      "0x69C527fC77291722b52649E45c838e41be8Bf5d5",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
      "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
      "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6");

      console.log("GMXETH Contract Address", gmxUni.target);
      return gmxUni;
    }
  
    describe("Deployment Basic Test", function () {
      let gmxUni;
      it("Should deploy", async function () {
        gmxUni = await loadFixture(deployGMXUNIContract);
        expect(await gmxUni.owner()).to.equal(owner.address);
      });
  
      it('Should get GM TOKEN Value Address', async function(){
        // console.log("KECCAK ", await gmxBtc.MAX_PNL_FACTOR_FOR_WITHDRAWALS());
        console.log("GM Token VALUE", await gmxUni.calculateGMPrice(BigInt(2571433574900651392)));
      })

      // it('Should get getAdjustedSupply', async function(){
      //   console.log("GM Adjusted supply ", await gmxUni.getAdjustedSupply(BigInt(7620293161910374028522110000000000), BigInt(72448696532436667439400000000000), BigInt(54056940787273695557787397837767890), BigInt(-30258188611021620216432750689167659866), BigInt(994913924)));
      // })

      //calculateGMPrice2
    //   it('Should get GM TOKEN Value Address', async function(){
    //     console.log("GM Token ", await gmxEth.calculateGMPrice2());
    //   })
    });
  });
  
  72072522758532944420856651143738234619
  594162442611019650861402999990982007