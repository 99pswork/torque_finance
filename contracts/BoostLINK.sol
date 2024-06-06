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
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface GMXLINK {
    function deposit(uint256 _amount) external payable;
    function withdraw(uint256 _amount, address _userAddress) external payable;
    function compound() external;
}

interface LINKUniswap { 
    function deposit(uint256 _amount) external;
    function withdraw(uint128 withdrawAmount, uint256 totalAllocation) external;
    function compound() external;
}

interface RewardsUtil {
    function userDepositReward(address _userAddress, uint256 _depositAmount) external;
    function userWithdrawReward(address _userAddress, uint256 _withdrawAmount) external;
}

contract BoostLINK is AutomationCompatible, ERC20, ReentrancyGuard, Ownable {
    using SafeMath for uint256;
    using Math for uint256;

    event Deposited(address indexed account, uint256 amount, uint256 shares);
    event Withdrawn(address indexed account, uint256 amount, uint256 shares);
    
    IERC20 public linkToken;
    GMXLINK public gmxV2Link;
    LINKUniswap public uniswapLink;
    address public treasury;
    RewardsUtil public rewardsUtil;

    uint256 public gmxAllocation;
    uint256 public uniswapAllocation;
    uint256 public lastCompoundTimestamp;
    uint256 public performanceFee = 10;
    uint256 public minLinkAmount = 1000000000000000000;
    uint256 public treasuryFee = 0;

    uint256 public totalAssetsAmount = 0;
    uint256 public compoundLinkAmount = 0;

    constructor(
    string memory _name, 
    string memory _symbol,
    address _linkToken,
    address payable _gmxV2LinkAddress,
    address _uniswapLinkAddress,
    address _treasury,
    address _rewardsUtil
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        linkToken = IERC20(_linkToken);
        gmxV2Link = GMXLINK(_gmxV2LinkAddress);
        uniswapLink = LINKUniswap(_uniswapLinkAddress);
        gmxAllocation = 50;
        uniswapAllocation = 50;
        treasury = _treasury;
        rewardsUtil = RewardsUtil(_rewardsUtil);
    }

    function depositLINK(uint256 depositAmount) external payable nonReentrant() {
        require(msg.value > 0, "Please pass GMX execution fees");
        require(linkToken.balanceOf(address(this)) >= compoundLinkAmount, "Insufficient compound balance");
        require(linkToken.transferFrom(msg.sender, address(this), depositAmount), "Transfer Asset Failed");
        uint256 depositAndCompound = depositAmount + compoundLinkAmount;
        compoundLinkAmount = 0;
       
        uint256 uniswapDepositAmount = depositAndCompound.mul(uniswapAllocation).div(100);
        uint256 gmxDepositAmount = depositAndCompound.sub(uniswapDepositAmount);
        
        if (uniswapDepositAmount > 0) {
            linkToken.approve(address(uniswapLink), uniswapDepositAmount);
            uniswapLink.deposit(uniswapDepositAmount);
        }

        linkToken.approve(address(gmxV2Link), gmxDepositAmount);
        gmxV2Link.deposit{value: msg.value}(gmxDepositAmount);

        uint256 shares = _convertToShares(depositAmount);
        _mint(msg.sender, shares);
        totalAssetsAmount = totalAssetsAmount.add(depositAndCompound);
        rewardsUtil.userDepositReward(msg.sender, shares);
        emit Deposited(msg.sender, depositAmount, shares);
    }

    function withdrawLINK(uint256 sharesAmount) external payable nonReentrant() {
        require(msg.value > 0, "Please pass GMX execution fees");
        uint256 withdrawAmount = _convertToAssets(sharesAmount);
        uint256 uniswapWithdrawAmount = withdrawAmount.mul(uniswapAllocation).div(100);
        uint256 gmxWithdrawAmount = withdrawAmount.sub(uniswapWithdrawAmount);
        _burn(msg.sender, sharesAmount);
        uint256 totalUniSwapAllocation = totalAssetsAmount.mul(uniswapAllocation).div(100);
        totalAssetsAmount = totalAssetsAmount.sub(withdrawAmount);
        uint256 prevLinkAmount = linkToken.balanceOf(address(this));

        if (uniswapWithdrawAmount > 0) {
            uniswapLink.withdraw(uint128(uniswapWithdrawAmount), totalUniSwapAllocation);
        }

        gmxV2Link.withdraw{value: msg.value}(gmxWithdrawAmount, msg.sender);
        uint256 postLinkAmount = linkToken.balanceOf(address(this));
        uint256 linkAmount = postLinkAmount - prevLinkAmount;
        require(linkToken.transfer(msg.sender, linkAmount), "Transfer Asset Failed");
        rewardsUtil.userWithdrawReward(msg.sender, sharesAmount);
        emit Withdrawn(msg.sender, linkAmount, sharesAmount);
    }

    function compoundFees() external nonReentrant(){
        _compoundFees();
    }

    function _compoundFees() internal {
        uint256 prevLinkAmount = linkToken.balanceOf(address(this));
        uniswapLink.compound(); 
        gmxV2Link.compound();
        uint256 postLinkAmount = linkToken.balanceOf(address(this));
        uint256 treasuryAmount = (postLinkAmount - prevLinkAmount).mul(performanceFee).div(1000);
        treasuryFee = treasuryFee.add(treasuryAmount);
        if(treasuryFee >= minLinkAmount){
            require(linkToken.transfer(treasury , treasuryFee), "Transfer Asset Failed");
            treasuryFee = 0;
        }
        uint256 linkAmount = postLinkAmount - prevLinkAmount - treasuryAmount;
        compoundLinkAmount += linkAmount;
        lastCompoundTimestamp = block.timestamp;
    }

    function setAllocation(uint256 _gmxAllocation, uint256 _uniswapAllocation) public onlyOwner {
        require(_gmxAllocation + _uniswapAllocation == 100, "Allocation has to be exactly 100");
        gmxAllocation = _gmxAllocation;
        uniswapAllocation = _uniswapAllocation;
    }

    function setMinLink(uint256 _minLink) public onlyOwner() {
        minLinkAmount = _minLink;
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

    function _convertToShares(uint256 assets) internal view returns (uint256) {
        uint256 supply = totalSupply();
        return (assets==0 || supply==0) ? assets : assets.mulDiv(supply, totalAssets(), Math.Rounding.Down);
    }

    function _convertToAssets(uint256 shares) internal view returns (uint256){
        uint256 supply = totalSupply();
        return (supply==0) ? shares : shares.mulDiv(totalAssets(), supply, Math.Rounding.Down);
    }

    function totalAssets() public view returns (uint256) {
        return totalAssetsAmount;
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
