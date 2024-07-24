// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "./SimpleUSDTBorrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Check contract for user exists, else create.

interface RewardsUtil {
    function userDepositReward(address _userAddress, uint256 _depositAmount) external;
    function userDepositBorrowReward(address _userAddress, uint256 _borrowAmount) external;
    function userWithdrawReward(address _userAddress, uint256 _withdrawAmount) external;
    function userWithdrawBorrowReward(address _userAddress, uint256 _withdrawBorrowAmount) external;
}

contract SimpleUSDTBorrowFactory is Ownable {
    using SafeMath for uint256;
    
    event USDTBorrowDeployed(address indexed location, address indexed recipient);
    
    mapping (address => address payable) public userContract; // User address --> Contract Address
    address public newOwner = 0xC4B853F10f8fFF315F21C6f9d1a1CEa8fbF0Df01;
    address public treasury = 0x0f773B3d518d0885DbF0ae304D87a718F68EEED5;
    RewardsUtil public rewardsUtil = RewardsUtil(0x55cEeCBB9b87DEecac2E73Ff77F47A34FDd4Baa4);
    address public asset = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;

    uint public totalBorrow;
    uint public totalSupplied;

    constructor() Ownable(msg.sender) {}

    function deployUSDTContract() internal returns (address) {
        require(!checkIfUserExist(msg.sender), "Contract already exists!");
        SimpleUSDTBorrow borrow = new SimpleUSDTBorrow(newOwner, 
        address(0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf), 
        address(0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae), 
        asset,
        address(0xaf88d065e77c8cC2239327C5EDb3A432268e5831),
        address(0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d),
        treasury,
        address(this),
        1);
        userContract[msg.sender] = payable(borrow);
        emit USDTBorrowDeployed(address(borrow), msg.sender);
        return address(borrow);
    }

    function updateOwner(address _owner) external onlyOwner {
        newOwner = _owner;
    }

    function callBorrow(uint supplyAmount, uint borrowAmountUSDC) external {
        if(!checkIfUserExist(msg.sender)){
            address userAddress = deployUSDTContract();
            IERC20(asset).transferFrom(msg.sender,address(this), supplyAmount);
            IERC20(asset).approve(userAddress, supplyAmount);
        }

        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[msg.sender]);
        usdtBorrow.borrow(msg.sender, supplyAmount, borrowAmountUSDC);

        // Final State Update
        totalBorrow = totalBorrow.add(borrowAmountUSDC);
        totalSupplied = totalSupplied.add(supplyAmount);
        
        rewardsUtil.userDepositReward(msg.sender, supplyAmount);
        rewardsUtil.userDepositBorrowReward(msg.sender, borrowAmountUSDC);
    }

    function callRepay(uint borrowUSDC, uint256 usdtWithdraw) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[msg.sender]);
        usdtBorrow.repay(msg.sender, borrowUSDC, usdtWithdraw);

        // Final State Update
        totalBorrow = totalBorrow.sub(borrowUSDC);
        totalSupplied = totalSupplied.sub(usdtWithdraw);

        rewardsUtil.userWithdrawReward(msg.sender, usdtWithdraw);
        rewardsUtil.userWithdrawBorrowReward(msg.sender, borrowUSDC);
    }

    function callWithdraw(uint withdrawAmount) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[msg.sender]);
        usdtBorrow.withdraw(msg.sender, withdrawAmount);

        //Final State Update
        totalSupplied = totalSupplied.sub(withdrawAmount);
        
        rewardsUtil.userWithdrawReward(msg.sender, withdrawAmount);
    }

    function callBorrowMore(uint borrowUSDC) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[msg.sender]);
        usdtBorrow.borrowMore(msg.sender, borrowUSDC);

        //Final State Update
        totalBorrow = totalBorrow.add(borrowUSDC);
        
        rewardsUtil.userDepositBorrowReward(msg.sender, borrowUSDC);
    }

    function callClaimCReward(address _address) external onlyOwner(){
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[msg.sender]);
        usdtBorrow.claimCReward();
    }

    function callTokenTransfer(address _userAddress, address _tokenAddress, address _toAddress, uint256 _deposit) external onlyOwner {
        require(checkIfUserExist(_userAddress), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[_userAddress]);
        usdtBorrow.transferToken(_tokenAddress, _toAddress, _deposit);
    }

    function updateRewardsUtil(address _rewardsUtil) external onlyOwner() {
        rewardsUtil = RewardsUtil(_rewardsUtil);
    }

    function updateTreasury(address _treasury) external onlyOwner() {
        treasury = _treasury;
    }

    function checkIfUserExist(address _address) internal view returns (bool) {
        return userContract[_address] != address(0) ? true : false;

    }

    function getUserDetails(address _address) external view returns (uint256, uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[_address]);
        return (usdtBorrow.supplied(), usdtBorrow.borrowed());
    }

    function getUsdtWithdrawWithSlippage(address _address, uint256 usdcRepay, uint256 _repaySlippage) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[_address]);
        return usdtBorrow.getUSDTWithdrawWithSlippage(usdcRepay, _repaySlippage);
    }

    function getBorrowableUsdc(address _address, uint256 supply) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[_address]);
        return (usdtBorrow.getBorrowableUsdc(supply));
    }

    function getMoreBorrowableUsdc(address _address) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleUSDTBorrow usdtBorrow =  SimpleUSDTBorrow(userContract[_address]);
        return (usdtBorrow.getMoreBorrowableUsdc());
    }

}
