const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");
  const uniswapABI = require('./uniswap.json');
   
  describe("ETHBorrow", function () {
    
    async function deployGMXETHContract() {
      // Contracts are deployed using the first signer/account by default
      [owner, otherAccount] = await ethers.getSigners();
      console.log("OWNER ADDRESS", owner.address);
      const GMXETH = await ethers.getContractFactory("GMXV2ETH");
      const gmxEth = await GMXETH.deploy("0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      "0x70d95587d40a2caf56bd97485ab3eec10bee6336",
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      "0x912ce59144191c1204e64559fe8253a0e49e6548",
      "0x7c68c7866a64fa2160f78eeae12217ffbf871fa8",
      "0xe592427a0aece92de3edee1f18e0157c05861564",
      "0xF89e77e8Dc11691C9e8757e84aaFbCD8A67d7A55",
      "0x0628D46b5D145f183AdB6Ef1f2c97eD1C4701C55",
      "0x7452c558d45f8afC8c83dAe62C3f8A5BE19c71f6");

      console.log("GMXETH Contract Address", gmxEth.target);
      return gmxEth;
    }
  
    describe("Deployment Basic Test", function () {
      let gmxEth;
      it("Should deploy", async function () {
        gmxEth = await loadFixture(deployGMXETHContract);
        expect(await gmxEth.owner()).to.equal(owner.address);
      });
  
      it('Should get GM TOKEN Value Address', async function(){
        console.log("KECCAK ", await gmxEth.MAX_PNL_FACTOR_FOR_WITHDRAWALS());
        console.log("GM Token VALUE", await gmxEth.calculateGMPrice(BigInt(886696950863250277)));
      })

      //calculateGMPrice2
    //   it('Should get GM TOKEN Value Address', async function(){
    //     console.log("GM Token ", await gmxEth.calculateGMPrice2());
    //   })
    });
  });
  
  72072522758532944420856651143738234619
  594162442611019650861402999990982007