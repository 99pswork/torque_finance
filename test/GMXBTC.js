const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const uniswapABI = require('./uniswap.json');
   
  describe("GMXBTC", function () {
    
    async function deployGMXBTCContract() {
      // Contracts are deployed using the first signer/account by default
      [owner, otherAccount] = await ethers.getSigners();
      console.log("OWNER ADDRESS", owner.address);
      const GMXBTC = await ethers.getContractFactory("GMXV2BTC");
      const gmxBtc = await GMXBTC.deploy("0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      "0x47c031236e19d024b42f8AE6780E44A573170703",
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "0x912ce59144191c1204e64559fe8253a0e49e6548",
      "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
      "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
      "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6");

      console.log("GMXETH Contract Address", gmxBtc.target);
      return gmxBtc;
    }
  
    describe("Deployment Basic Test", function () {
      let gmxBtc;
      it("Should deploy", async function () {
        gmxBtc = await loadFixture(deployGMXBTCContract);
        expect(await gmxBtc.owner()).to.equal(owner.address);
      });
  
      it('Should get GM TOKEN Value Address', async function(){
        // console.log("KECCAK ", await gmxBtc.MAX_PNL_FACTOR_FOR_WITHDRAWALS());
        console.log("GM Token VALUE", await gmxBtc.calculateGMPrice(BigInt(1690990593069474751)));
      })

      it('Should get getAdjustedSupply', async function(){
        console.log("GM Adjusted supply ", await gmxBtc.getAdjustedSupply(BigInt(7620293161910374028522110000000000), BigInt(72448696532436667439400000000000), BigInt(54056940787273695557787397837767890), BigInt(-30258188611021620216432750689167659866), BigInt(994913924)));
      })

      //calculateGMPrice2
    //   it('Should get GM TOKEN Value Address', async function(){
    //     console.log("GM Token ", await gmxEth.calculateGMPrice2());
    //   })
    });
  });
  
  72072522758532944420856651143738234619
  594162442611019650861402999990982007