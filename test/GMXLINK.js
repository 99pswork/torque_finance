const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const uniswapABI = require('./uniswap.json');
   
  describe("GMXBTC", function () {
    
    async function deployGMXLINKContract() {
      // Contracts are deployed using the first signer/account by default
      [owner, otherAccount] = await ethers.getSigners();
      console.log("OWNER ADDRESS", owner.address);
      const GMXLINK = await ethers.getContractFactory("GMXV2LINK");
      const gmxLink = await GMXLINK.deploy("0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
      "0x7f1fa204bb700853D36994DA19F830b6Ad18455C",
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "0x912ce59144191c1204e64559fe8253a0e49e6548",
      "0x69C527fC77291722b52649E45c838e41be8Bf5d5",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
      "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
      "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6");

      console.log("GMXETH Contract Address", gmxLink.target);
      return gmxLink;
    }
  
    describe("Deployment Basic Test", function () {
      let gmxLink;
      it("Should deploy", async function () {
        gmxLink = await loadFixture(deployGMXLINKContract);
        expect(await gmxLink.owner()).to.equal(owner.address);
      });
  
      it('Should get GM TOKEN Value Address', async function(){
        // console.log("KECCAK ", await gmxBtc.MAX_PNL_FACTOR_FOR_WITHDRAWALS());
        console.log("GM Token VALUE", await gmxLink.calculateGMPrice(BigInt(1056230965556819589)));
      })

      // it('Should get getAdjustedSupply', async function(){
      //   console.log("GM Adjusted supply ", await gmxLink.getAdjustedSupply(BigInt(7620293161910374028522110000000000), BigInt(72448696532436667439400000000000), BigInt(54056940787273695557787397837767890), BigInt(-30258188611021620216432750689167659866), BigInt(994913924)));
      // })

      //calculateGMPrice2
    //   it('Should get GM TOKEN Value Address', async function(){
    //     console.log("GM Token ", await gmxEth.calculateGMPrice2());
    //   })
    });
  });
  
  72072522758532944420856651143738234619
  594162442611019650861402999990982007