// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|


import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IStargateLPStaking.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IGMX.sol";

import "./strategies/StargateETH.sol";
import "./strategies/GMXV2ETH.sol";

contract BoostETH is AutomationCompatible, ERC4626, ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    
    IERC20 public wethToken; // WETH Address
    GMXV2ETH public gmxV2Eth;
    StargateETH public stargateETH;
    address public treasury;

    uint256 public gmxAllocation = 50;
    uint256 public stargateAllocation = 50;
    uint256 public lastCompoundTimestamp;
    uint256 public performanceFee;

    constructor(
    string memory _name, 
    string memory _symbol,
    address _gmxV2ETHAddress,
    address _startgateETHAddress,
    IERC20 _asset,
    address _treasury
    ) ERC4626(_asset) Ownable(msg.sender) ERC20(_name, _symbol) {
        gmxV2Eth = GMXV2ETH(_gmxV2ETHAddress);
        stargateETH = StargateETH(_startgateETHAddress);
        wethToken = _asset;
        treasury = _treasury;
    }

    function deposit(uint256 _amount) public nonReentrant {
        _deposit(_amount);
    }

    function withdraw(uint256 sharesAmount) public nonReentrant {
        _withdraw(sharesAmount);
    }

    function compoundFees() public nonReentrant {
        _compoundFees();
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp >= lastCompoundTimestamp + 12 hours);
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp >= lastCompoundTimestamp + 12 hours)) {
            _compoundFees();
        }
    }

    function _deposit(uint256 amount) internal {
        require(amount > 0, "Deposit amount must be greater than zero");
        uint256 gmxAllocationAmount = amount.mul(gmxAllocation).div(100);
        uint256 stargateAllocationAmount = amount.sub(gmxAllocationAmount);
        wethToken.approve(address(gmxV2Eth), gmxAllocationAmount);
        gmxV2Eth.deposit(gmxAllocationAmount);
        wethToken.approve(address(stargateETH), stargateAllocationAmount);
        stargateETH.deposit(stargateAllocationAmount);
        uint256 shares = _convertToShares(amount, Math.Rounding.Down);
        _mint(msg.sender, shares);
    }

    function _withdraw(uint256 sharesAmount) internal {
        require(sharesAmount > 0, "Withdraw amount must be greater than zero");
        require(balanceOf(msg.sender) >= sharesAmount, "Insufficient balance");
        uint256 totalETHAmount = _convertToAssets(sharesAmount, Math.Rounding.Down);
        uint256 gmxWithdrawAmount = totalETHAmount.mul(gmxAllocation).div(100);
        uint256 stargateWithdrawAmount = totalETHAmount.sub(gmxWithdrawAmount);
        _burn(msg.sender, sharesAmount);
        gmxV2Eth.withdraw(gmxWithdrawAmount);
        stargateETH.withdraw(stargateWithdrawAmount);
        wethToken.transfer(msg.sender, totalETHAmount);
    }

    function _compoundFees() internal {
        uint256 gmxV2ethBalanceBefore = gmxV2Eth.balanceOf(address(this));
        uint256 stargateEthBalanceBefore = stargateETH.balanceOf(address(this));
        uint256 totalBalanceBefore = gmxV2ethBalanceBefore.add(stargateEthBalanceBefore);
        // gmxV2Eth.withdrawGMX(); // PS fix this
        // stargateETH.withdrawuniswap(); // PS fix this
        uint256 feeAmount = totalBalanceBefore.mul(performanceFee).div(10000);
        uint256 treasuryFee = performanceFee.mul(performanceFee).div(100);
        uint256 gmxV2btcFee = gmxV2Eth.balanceOf(address(this));
        uint256 uniswapbtcFee = stargateETH.balanceOf(address(this));
        wethToken.transfer(treasury, treasuryFee);
        uint256 totalBalanceAfter = gmxV2btcFee.add(uniswapbtcFee);
        uint256 gmxV2btcFeeActualPercent = gmxV2btcFee.mul(100).div(totalBalanceAfter);
        uint256 uniswapbtcFeeActualPercent = uniswapbtcFee.mul(100).div(totalBalanceAfter);
        // gmxV2Eth.deposit(); // PS FIX THIS
        // stargateETH.deposit(); // PS FIX THIS
        lastCompoundTimestamp = block.timestamp;
    }

    function setAllocation(uint _gmxAllocation,uint _stargateAllocation) public onlyOwner {
        require(_gmxAllocation + _stargateAllocation == 100, "Allocation more than 100%");
        gmxAllocation = _gmxAllocation;
        stargateAllocation = _stargateAllocation;
    }

    function setPerformanceFee(uint256 _performanceFee) public onlyOwner {
        performanceFee = _performanceFee;
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function _checkUpkeep(bytes calldata) external virtual view returns (bool upkeepNeeded, bytes memory){

    }
    
    function _performUpkeep(bytes calldata) external virtual{
        
    }

    receive() external payable {}
}
