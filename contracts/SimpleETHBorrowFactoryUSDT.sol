// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "./SimpleETHBorrowUSDT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Check contract for user exists, else create.

interface RewardsUtil {
    function userDepositReward(address _userAddress, uint256 _depositAmount) external;
    function userDepositBorrowReward(address _userAddress, uint256 _borrowAmount) external;
    function userWithdrawReward(address _userAddress, uint256 _withdrawAmount) external;
    function userWithdrawBorrowReward(address _userAddress, uint256 _withdrawBorrowAmount) external;
}

contract SimpleETHBorrowUSDTFactory is Ownable {
    using SafeMath for uint256;
    
    event ETHBorrowDeployed(address indexed location, address indexed recipient);
    
    mapping (address => address payable) public userContract; // User address --> Contract Address
    address public newOwner = 0x7fb3933a47D20ab591D4F136E36865576c6f305c;
    address public treasury = 0x177f6519A523EEbb542aed20320EFF9401bC47d0;
    RewardsUtil public torqRewardsUtil = RewardsUtil(0x3452faA42fd613937dCd43E0f0cBf7d4205919c5);
    RewardsUtil public arbRewardsUtil = RewardsUtil(0x6965b496De9b7C0bF274F8f6D5Dfa359Ac7D3b72);
    address public asset = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;

    uint public totalBorrow;
    uint public totalSupplied;

    constructor() Ownable(msg.sender) {}

    function deployETHContract() internal returns (address) {
        require(!checkIfUserExist(msg.sender), "Contract already exists!");
        SimpleETHBorrowUSDT borrow = new SimpleETHBorrowUSDT(newOwner, 
        address(0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07), 
        address(0x88730d254A2f7e6AC8388c3198aFd694bA9f7fae), 
        asset,
        address(0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9),
        address(0xbdE8F31D2DdDA895264e27DD990faB3DC87b372d),
        treasury,
        address(this),
        1);
        userContract[msg.sender] = payable(borrow);
        emit ETHBorrowDeployed(address(borrow), msg.sender);
        return address(borrow);
    }

    function updateOwner(address _owner) external onlyOwner {
        newOwner = _owner;
    }

    function callBorrow(uint supplyAmount, uint borrowAmountUSDT) external {
        if(!checkIfUserExist(msg.sender)){
            address userAddress = deployETHContract();
            IERC20(asset).transferFrom(msg.sender,address(this), supplyAmount);
            IERC20(asset).approve(userAddress, supplyAmount);
        }

        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[msg.sender]);
        ethBorrow.borrow(msg.sender, supplyAmount, borrowAmountUSDT);

        // Final State Update
        totalBorrow = totalBorrow.add(borrowAmountUSDT);
        totalSupplied = totalSupplied.add(supplyAmount);
        
        torqRewardsUtil.userDepositReward(msg.sender, supplyAmount);
        torqRewardsUtil.userDepositBorrowReward(msg.sender, borrowAmountUSDT);
        
        arbRewardsUtil.userDepositReward(msg.sender, supplyAmount);
        arbRewardsUtil.userDepositBorrowReward(msg.sender, borrowAmountUSDT);
    }

    function callRepay(uint borrowUsdt, uint256 WethWithdraw) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[msg.sender]);
        ethBorrow.repay(msg.sender, borrowUsdt, WethWithdraw);

        // Final State Update
        totalBorrow = totalBorrow.sub(borrowUsdt);
        totalSupplied = totalSupplied.sub(WethWithdraw);

        torqRewardsUtil.userWithdrawReward(msg.sender, WethWithdraw);
        torqRewardsUtil.userWithdrawBorrowReward(msg.sender, borrowUsdt);

        arbRewardsUtil.userWithdrawReward(msg.sender, WethWithdraw);
        arbRewardsUtil.userWithdrawBorrowReward(msg.sender, borrowUsdt);
    }

    function callWithdraw(uint withdrawAmount) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[msg.sender]);
        ethBorrow.withdraw(msg.sender, withdrawAmount);

        //Final State Update
        totalSupplied = totalSupplied.sub(withdrawAmount);
        
        torqRewardsUtil.userWithdrawReward(msg.sender, withdrawAmount);
        arbRewardsUtil.userWithdrawReward(msg.sender, withdrawAmount);
    }

    function callBorrowMore(uint borrowUSDt) external {
        require(checkIfUserExist(msg.sender), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow =  SimpleETHBorrowUSDT(userContract[msg.sender]);
        ethBorrow.borrowMore(msg.sender, borrowUSDt);

        //Final State Update
        totalBorrow = totalBorrow.add(borrowUSDt);
        
        torqRewardsUtil.userDepositBorrowReward(msg.sender, borrowUSDt);
        arbRewardsUtil.userDepositBorrowReward(msg.sender, borrowUSDt);
    }

    function callClaimCReward(address _address) external onlyOwner(){
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[msg.sender]);
        ethBorrow.claimCReward();
    }

    function callTokenTransfer(address _userAddress, address _tokenAddress, address _toAddress, uint256 _deposit) external onlyOwner {
        require(checkIfUserExist(_userAddress), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[_userAddress]);
        ethBorrow.transferToken(_tokenAddress, _toAddress, _deposit);
    }

    function updateRewardsUtil(address _torqRewardsUtil, address _arbRewardsUtil) external onlyOwner() {
        torqRewardsUtil = RewardsUtil(_torqRewardsUtil);
        arbRewardsUtil = RewardsUtil(_arbRewardsUtil);
    }

    function updateTreasury(address _treasury) external onlyOwner() {
        treasury = _treasury;
    }

    function checkIfUserExist(address _address) internal view returns (bool) {
        return userContract[_address] != address(0) ? true : false;

    }

    function getUserDetails(address _address) external view returns (uint256, uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[_address]);
        return (ethBorrow.supplied(), ethBorrow.borrowed());
    }

    function getWethWithdrawWithSlippage(address _address, uint256 usdtRepay, uint256 _repaySlippage) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[_address]);
        return ethBorrow.getWETHWithdrawWithSlippage(usdtRepay, _repaySlippage);
    }

    function getBorrowableUsdt(address _address, uint256 supply) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow = SimpleETHBorrowUSDT(userContract[_address]);
        return (ethBorrow.getBorrowableUsdt(supply));
    }

    function getMoreBorrowableUsdt(address _address) external view returns (uint256) {
        require(checkIfUserExist(_address), "Contract not created!");
        SimpleETHBorrowUSDT ethBorrow =  SimpleETHBorrowUSDT(userContract[_address]);
        return (ethBorrow.getMoreBorrowableUsdt());
    }
}
