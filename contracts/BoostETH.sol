// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./interfaces/IWETH9.sol";
import "./strategies/GMXV2ETH.sol";
import "./strategies/StargateETH.sol";

interface RewardsUtil {
    function userDepositReward(address _userAddress, uint256 _depositAmount) external;
    function userWithdrawReward(address _userAddress, uint256 _withdrawAmount) external;
}

contract BoostETH is AutomationCompatible, Ownable, ReentrancyGuard, ERC20{
    using SafeMath for uint256;
    using Math for uint256;

    IWETH9 public weth;
    GMXV2ETH public gmxV2ETH;
    StargateETH public stargateETH;
    RewardsUtil public rewardsUtil;
    address public treasury;

    uint256 public gmxAllocation;
    uint256 public stargateAllocation;
    uint256 public lastCompoundTimestamp;
    uint256 public performanceFee;
    uint256 public minWethAmount = 4000000000000000;
    uint256 public compoundWethAmount = 0;
    uint256 public treasuryFee = 0;
    
    uint256 public totalAssetsAmount;

    constructor(string memory _name, string memory _symbol, address payable weth_, address payable gmxV2ETH_, address payable stargateETH_, address treasury_, address _rewardsUtil) ERC20(_name, _symbol) Ownable(msg.sender) {
        weth = IWETH9(weth_);
        gmxV2ETH = GMXV2ETH(gmxV2ETH_);
        stargateETH = StargateETH(stargateETH_);
        treasury = treasury_;
        rewardsUtil = RewardsUtil(_rewardsUtil);
        gmxAllocation = 50;
        stargateAllocation = 50;
        performanceFee = 10;
        lastCompoundTimestamp = block.timestamp;
        totalAssetsAmount = 0;
    }

    function depositETH(uint256 depositAmount) external payable nonReentrant() {
        require(msg.value > 0, "You must pay GMX v2 execution fee");
        require(weth.balanceOf(address(this)) >= compoundWethAmount, "Insufficient compound balance");
        
        weth.transferFrom(msg.sender, address(this), depositAmount);
        uint256 depositAndCompound = depositAmount + compoundWethAmount;
        compoundWethAmount = 0;
        uint256 stargateDepositAmount = depositAndCompound.mul(stargateAllocation).div(100);
        uint256 gmxDepositAmount = depositAndCompound.sub(stargateDepositAmount);
        weth.approve(address(stargateETH), stargateDepositAmount);
        stargateETH.deposit(stargateDepositAmount);

        weth.approve(address(gmxV2ETH), gmxDepositAmount);
        gmxV2ETH.deposit{value: msg.value}(gmxDepositAmount);

        uint256 shares = _convertToShares(depositAmount);
        _mint(msg.sender, shares);
        totalAssetsAmount = totalAssetsAmount.add(depositAndCompound);
        rewardsUtil.userDepositReward(msg.sender, shares);
    }

    function withdrawETH(uint256 sharesAmount) external payable nonReentrant() {
        require(msg.value > 0, "You must pay GMX v2 execution fee");
        uint256 withdrawAmount = _convertToAssets(sharesAmount);
        uint256 stargateWithdrawAmount = withdrawAmount.mul(stargateAllocation).div(100);
        uint256 gmxWithdrawAmount = withdrawAmount.sub(stargateWithdrawAmount);
        _burn(msg.sender, sharesAmount);
        totalAssetsAmount = totalAssetsAmount.sub(withdrawAmount);
       
        uint256 prevWethAmount = weth.balanceOf(address(this));
        stargateETH.withdraw(stargateWithdrawAmount);
        gmxV2ETH.withdraw{value: msg.value}(gmxWithdrawAmount, msg.sender);
        uint256 postWethAmount = weth.balanceOf(address(this));
        uint256 wethAmount = postWethAmount - prevWethAmount;
        weth.transfer(msg.sender, wethAmount);
        rewardsUtil.userWithdrawReward(msg.sender, sharesAmount);
    }

    function totalAssets() public view returns (uint256) {
        return totalAssetsAmount;
    }

    function _convertToShares(uint256 assets) internal view returns (uint256) {
        uint256 supply = totalSupply();
        return (assets==0 || supply==0) ? assets : assets.mulDiv(supply, totalAssets(), Math.Rounding.Down);
    }

    function _convertToAssets(uint256 shares) internal view returns (uint256){
        uint256 supply = totalSupply();
        return (supply==0) ? shares : shares.mulDiv(totalAssets(), supply, Math.Rounding.Down);
    }

    function compoundFees() external nonReentrant(){
        _compoundFees();
    }

    function _compoundFees() internal {
        uint256 prevWethAmount = weth.balanceOf(address(this));
        stargateETH.compound();
        gmxV2ETH.compound();
        uint256 postWethAmount = weth.balanceOf(address(this));
        uint256 treasuryAmount = (postWethAmount - prevWethAmount).mul(performanceFee).div(1000);
        treasuryFee = treasuryFee.add(treasuryAmount);
        if(treasuryFee >= minWethAmount){
            weth.transfer(treasury, treasuryFee);
            treasuryFee = 0;
        }
        uint256 wethAmount = postWethAmount - prevWethAmount - treasuryAmount;
        compoundWethAmount += wethAmount;
        lastCompoundTimestamp = block.timestamp;
    }

    function setMinWeth(uint256 _minWeth) public onlyOwner() {
        minWethAmount = _minWeth;
    }

    function setAllocation(uint256 _stargateAllocation, uint256 _gmxAllocation) public onlyOwner {
        require((_stargateAllocation + _gmxAllocation)==100, "All allocation should be 100");
        gmxAllocation = _gmxAllocation;
        stargateAllocation = _stargateAllocation;
    }

    function setPerformanceFee(uint256 _performanceFee) public onlyOwner {
        require(_performanceFee <= 1000, "Treasury Fee can't be more than 100%");
        performanceFee = _performanceFee;
    }

    function setTreasury(address _treasury) public onlyOwner {
        treasury = _treasury;
    }

    function withdrawTreasuryFees() external onlyOwner() {
        payable(treasury).transfer(address(this).balance);
    }

    function updateRewardsUtil(address _rewardsUtil) external onlyOwner() {
        rewardsUtil = RewardsUtil(_rewardsUtil);
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = (block.timestamp >= lastCompoundTimestamp + 12 hours);
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp >= lastCompoundTimestamp + 12 hours)) {
            _compoundFees();
        }
    }

    receive() external payable {}
}