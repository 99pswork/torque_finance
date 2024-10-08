// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ARBRewardUtil is ReentrancyGuard, Ownable { 
    using SafeMath for uint256;

    struct RewardConfig {
        uint256 rewardFactor;
        uint256 torquePool;
        uint256 borrowFactor; 
    }

    struct UserRewardConfig {
        uint256 rewardAmount;
        uint256 depositAmount;
        uint256 borrowAmount;
        uint256 lastRewardBlock;
        bool isActive;
    }

    IERC20 public arbToken = IERC20(0x912CE59144191C1204E64559FE8253a0e49E6548);
    address public governor = address(0x7fb3933a47D20ab591D4F136E36865576c6f305c);
    bool public claimsPaused = false;

    mapping(address => bool) public isTorqueContract;
    mapping(address => RewardConfig) public rewardConfig;
    mapping(address => mapping(address => UserRewardConfig)) public rewardsClaimed;


    event GovernorTransferred(address indexed oldGovernor, address indexed newGovernor);
    event RewardClaimed(address indexed user, address indexed torqueContract, uint256 amount);
    event RewardFactorUpdated(address indexed torqueContract, uint256 rewardFactor);
    event BorrowFactorUpdated(address indexed torqueContract, uint256 borrowFactor);
    event TorquePoolUpdated(address torqueContract,uint256 _poolAmount);
    event TorqueContractAdded(address torqueContract,uint256 _poolAmount, uint256 rewardFactor, uint256 borrowFactor);

    error NotPermitted(address);
    error InvalidTorqueContract(address);

    constructor() Ownable(msg.sender) {}

    modifier onlyGovernor() {
        if (msg.sender != governor) revert NotPermitted(msg.sender);
        _;
    }

    function userDepositReward(address _userAddress, uint256 _depositAmount) external {
        require(isTorqueContract[msg.sender], "Unauthorised!");
        updateReward(msg.sender, _userAddress);
        rewardsClaimed[msg.sender][_userAddress].depositAmount = rewardsClaimed[msg.sender][_userAddress].depositAmount.add(_depositAmount);
        rewardsClaimed[msg.sender][_userAddress].lastRewardBlock = block.number;
        rewardsClaimed[msg.sender][_userAddress].isActive = true;
    }

    function userDepositBorrowReward(address _userAddress, uint256 _borrowAmount) external {
        require(isTorqueContract[msg.sender], "Unauthorised!");
        updateReward(msg.sender, _userAddress);
        rewardsClaimed[msg.sender][_userAddress].borrowAmount = rewardsClaimed[msg.sender][_userAddress].borrowAmount.add(_borrowAmount);
        rewardsClaimed[msg.sender][_userAddress].lastRewardBlock = block.number;
        rewardsClaimed[msg.sender][_userAddress].isActive = true;
    }

    function userWithdrawReward(address _userAddress, uint256 _withdrawAmount) external {
        require(isTorqueContract[msg.sender], "Unauthorised!");
        require(_withdrawAmount <= rewardsClaimed[msg.sender][_userAddress].depositAmount, "Cannot withdraw more than deposit!");
        updateReward(msg.sender, _userAddress);
        rewardsClaimed[msg.sender][_userAddress].depositAmount = rewardsClaimed[msg.sender][_userAddress].depositAmount.sub(_withdrawAmount);
        if(rewardsClaimed[msg.sender][_userAddress].depositAmount == 0 && rewardsClaimed[msg.sender][_userAddress].borrowAmount == 0){
            rewardsClaimed[msg.sender][_userAddress].isActive = false;
        }
    }

    function userWithdrawBorrowReward(address _userAddress, uint256 _withdrawBorrowAmount) external {
        require(isTorqueContract[msg.sender], "Unauthorised!");
        require(_withdrawBorrowAmount <= rewardsClaimed[msg.sender][_userAddress].borrowAmount, "Cannot withdraw more than deposit!");
        updateReward(msg.sender, _userAddress);
        rewardsClaimed[msg.sender][_userAddress].borrowAmount = rewardsClaimed[msg.sender][_userAddress].borrowAmount.sub(_withdrawBorrowAmount);
        if(rewardsClaimed[msg.sender][_userAddress].depositAmount == 0 && rewardsClaimed[msg.sender][_userAddress].borrowAmount == 0){
            rewardsClaimed[msg.sender][_userAddress].isActive = false;
        }
    }

    function setrewardFactor(address torqueContract, uint256 _rewardFactor) public onlyGovernor() {
        rewardConfig[torqueContract].rewardFactor = _rewardFactor;
        emit RewardFactorUpdated(torqueContract, _rewardFactor);
    }

    function setTorquePool(address _torqueContract, uint256 _poolAmount) public onlyGovernor() {
        rewardConfig[_torqueContract].torquePool = _poolAmount;
        emit TorquePoolUpdated(_torqueContract, _poolAmount);
    }

    function setBorrowFactor(address _torqueContract, uint256 _borrowFactor) public onlyGovernor() {
        rewardConfig[_torqueContract].borrowFactor = _borrowFactor;
        emit BorrowFactorUpdated(_torqueContract, _borrowFactor);
    }

    function updateReward(address torqueContract, address user) internal nonReentrant {
        _calculateAndUpdateReward(torqueContract, user);
    }

    function updateArbToken(address _arbToken) external onlyGovernor() {
        arbToken = IERC20(_arbToken);
    }

    function addTorqueContract(address _address, uint256 _rewardPool, uint256 _rewardFactor, uint256 _borrowFactor) public onlyOwner {
        if (_rewardFactor == 0) {
            revert InvalidTorqueContract(_address);
        }
        isTorqueContract[_address] = true;
        rewardConfig[_address].rewardFactor = _rewardFactor;
        rewardConfig[_address].borrowFactor = _borrowFactor;
        rewardConfig[_address].torquePool = _rewardPool;

        emit TorqueContractAdded(_address, _rewardPool, _rewardFactor, _borrowFactor);
    }

    function _calculateAndUpdateBorrowReward(address _torqueContract, address _userAddress) internal {
        uint256 blocks = block.number - rewardsClaimed[_torqueContract][_userAddress].lastRewardBlock;
        uint256 userReward = blocks.mul(rewardsClaimed[_torqueContract][_userAddress].borrowAmount);
        userReward = userReward.mul(rewardConfig[_torqueContract].torquePool);
        userReward = userReward.div(rewardConfig[_torqueContract].borrowFactor);
        rewardsClaimed[_torqueContract][_userAddress].rewardAmount = rewardsClaimed[_torqueContract][_userAddress].rewardAmount.add(userReward);
    }

    function _calculateAndUpdateReward(address _torqueContract, address _userAddress) internal {
        if(!rewardsClaimed[_torqueContract][_userAddress].isActive){
            return;
        }
        uint256 blocks = block.number - rewardsClaimed[_torqueContract][_userAddress].lastRewardBlock;
        uint256 userReward = blocks.mul(rewardsClaimed[_torqueContract][_userAddress].depositAmount);
        userReward = userReward.mul(rewardConfig[_torqueContract].torquePool);
        userReward = userReward.div(rewardConfig[_torqueContract].rewardFactor);
        if(rewardConfig[_torqueContract].borrowFactor > 0 && rewardsClaimed[_torqueContract][_userAddress].borrowAmount > 0){
            _calculateAndUpdateBorrowReward(_torqueContract, _userAddress);
        }
        rewardsClaimed[_torqueContract][_userAddress].lastRewardBlock = block.number;
        rewardsClaimed[_torqueContract][_userAddress].rewardAmount = rewardsClaimed[_torqueContract][_userAddress].rewardAmount.add(userReward);
    }

    function _calculateBorrowReward(address _torqueContract, address _userAddress) internal view returns (uint256) {
        uint256 blocks = block.number - rewardsClaimed[_torqueContract][_userAddress].lastRewardBlock;
        uint256 userReward = blocks.mul(rewardsClaimed[_torqueContract][_userAddress].borrowAmount);
        userReward = userReward.mul(rewardConfig[_torqueContract].torquePool);
        userReward = userReward.div(rewardConfig[_torqueContract].borrowFactor);
        return userReward;
    }

    function _calculateReward(address _torqueContract, address _userAddress) public view returns (uint256) {
        uint256 blocks = block.number - rewardsClaimed[_torqueContract][_userAddress].lastRewardBlock;
        uint256 userReward = blocks.mul(rewardsClaimed[_torqueContract][_userAddress].depositAmount); 
        userReward = userReward.mul(rewardConfig[_torqueContract].torquePool);
        userReward = userReward.div(rewardConfig[_torqueContract].rewardFactor);
        uint256 borrowReward;
        if(rewardConfig[_torqueContract].borrowFactor > 0 && rewardsClaimed[_torqueContract][_userAddress].borrowAmount > 0){
            borrowReward = _calculateBorrowReward(_torqueContract, _userAddress);
        }
        return borrowReward + userReward + rewardsClaimed[_torqueContract][_userAddress].rewardAmount;
    }

    function claimReward(address[] memory _torqueContract) external {
        require(!claimsPaused, "Claims are paused!");
        uint256 rewardAmount = 0;
        for(uint i=0;i<_torqueContract.length;i++){
            updateReward(_torqueContract[i], msg.sender);
            rewardAmount = rewardAmount.add(rewardsClaimed[_torqueContract[i]][msg.sender].rewardAmount);
            rewardsClaimed[_torqueContract[i]][msg.sender].rewardAmount = 0;
        }
        require(arbToken.balanceOf(address(this)) >= rewardAmount, "Insufficient ARB");
        require(rewardAmount > 0 ,"No rewards found!");
        require(arbToken.transfer(msg.sender, rewardAmount), "Transfer Asset Failed");
    }

    function transferGovernor(address newGovernor) external onlyGovernor {
        address oldGovernor = governor;
        governor = newGovernor;
        emit GovernorTransferred(oldGovernor, newGovernor);
    }

    function pauseClaims(bool _pause) external onlyGovernor {
        claimsPaused = _pause;
    }

    function withdrawArb(uint256 _amount) external onlyOwner() {
        require(arbToken.transfer(msg.sender, _amount), "Transfer Asset Failed");
    }

    function getRewardConfig(address _torqueContract, address _user) public view returns (UserRewardConfig memory){
        return rewardsClaimed[_torqueContract][_user];
    }
}
