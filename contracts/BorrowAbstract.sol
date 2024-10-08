// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "./interfaces/IComet.sol";
import "./interfaces/IBulker.sol";
import "./interfaces/ICometRewards.sol";
import "./interfaces/ITUSDEngine.sol";
import "./interfaces/ITokenDecimals.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract BorrowAbstract is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    address public comet;
    address public cometReward;
    address public asset;
    address public baseAsset;
    address public bulker;
    address public engine;
    address public tusd;
    address public treasury;
    address public controller;
    uint public claimPeriod;
    uint public repaySlippage;
    uint public lastClaimCometTime;

    uint256 public borrowHealth;

    uint256 public decimalAdjust = 1000000000000;
    
    bytes32 public constant ACTION_SUPPLY_ASSET = "ACTION_SUPPLY_ASSET";
    bytes32 public constant ACTION_SUPPLY_ETH = "ACTION_SUPPLY_NATIVE_TOKEN";
    bytes32 public constant ACTION_TRANSFER_ASSET = "ACTION_TRANSFER_ASSET";
    bytes32 public constant ACTION_WITHDRAW_ASSET = "ACTION_WITHDRAW_ASSET";
    bytes32 public constant ACTION_WITHDRAW_ETH = "ACTION_WITHDRAW_NATIVE_TOKEN";
    bytes32 public constant ACTION_CLAIM_REWARD = "ACTION_CLAIM_REWARD";

    uint256 LIQUIDATION_THRESHOLD;
    uint256 PRECISION;
    uint256 LIQUIDATION_PRECISION;
    uint256 MIN_HEALTH_FACTOR;

    constructor(
        address _initialOwner,
        address _comet, // Compound V3 Address
        address _cometReward, // Address for Claiming Comet Rewards
        address _asset, // Collateral to be staked (WBTC / WETH)
        address _baseAsset, // Borrowing Asset (USDC)
        address _bulker, // Bulker Contract
        address _engine, // Torque USD Engine 
        address _tusd, // TUSD Token
        address _treasury, // Fees Address
        address _controller,
        uint _repaySlippage // Slippage %
    ) {
        Ownable.transferOwnership(_initialOwner);
        comet = _comet;
        cometReward = _cometReward;
        asset = _asset;
        baseAsset = _baseAsset;
        bulker = _bulker;
        engine = _engine;
        tusd = _tusd;
        treasury = _treasury;
        IComet(_comet).allow(_bulker, true);
        claimPeriod = 86400; // 1 day in seconds
        repaySlippage = _repaySlippage;
        controller = _controller;
        fetchValues();
    }
    
    uint constant BASE_ASSET_MANTISA = 1e6;
    uint constant PRICE_MANTISA = 1e2;
    uint constant SCALE = 1e18;
    uint constant WITHDRAW_OFFSET = 1e2;
    uint constant TUSD_DECIMAL_OFFSET = 1e12;
    uint constant PRICE_SCALE = 1e8;

    uint public baseBorrowed; // TUSD borrowed 
    uint public borrowed; // USDC Borrowed 
    uint public supplied; // WBTC Supplied
    uint public borrowTime; // Borrow time

    event UserBorrow(address user, address collateralAddress, uint amount);
    event UserRepay(address user, address collateralAddress, uint repayAmount, uint claimAmount);

    function fetchValues() public {
        LIQUIDATION_THRESHOLD = ITUSDEngine(engine).getLiquidationThreshold();
        PRECISION = ITUSDEngine(engine).getPrecision();
        LIQUIDATION_PRECISION = ITUSDEngine(engine).getLiquidationPrecision();
        MIN_HEALTH_FACTOR = ITUSDEngine(engine).getMinHealthFactor();
    }

    function getCollateralFactor() public view returns (uint){
        IComet icomet = IComet(comet);
        IComet.AssetInfo memory info = icomet.getAssetInfoByAddress(asset);
        return info.borrowCollateralFactor;
    }

    function getUserBorrowable() public view returns (uint){
        if(supplied == 0) {
            return 0; 
        }
        uint assetSupplyAmount = supplied;
        uint maxUsdc = getBorrowableUsdc(assetSupplyAmount);
        uint maxTusd = getBorrowableV2(maxUsdc); 
        return maxTusd;
    }

    function getBorrowableV2(uint maxUSDC) public view returns (uint){
        uint mintable = getMintableToken(maxUSDC, baseBorrowed, 0);
        return mintable;
    }
    
    function getBorrowableUsdc(uint supplyAmount) public view returns (uint) {
        IComet icomet = IComet(comet);
        IComet.AssetInfo memory info = icomet.getAssetInfoByAddress(asset);
        uint assetDecimal = ITokenDecimals(asset).decimals();
        return supplyAmount
            .mul(info.borrowCollateralFactor)
            .mul(icomet.getPrice(info.priceFeed))
            .div(PRICE_MANTISA)
            .div(10**assetDecimal)
            .div(SCALE);
    }

    function withdraw(address _address, uint withdrawAmount) public nonReentrant() {
        require(msg.sender == controller, "Cannot be called directly");
        require(supplied > 0, "User does not have asset");
        if (borrowed > 0) {
            uint accruedInterest = calculateInterest(borrowed, borrowTime);
            borrowed = borrowed.add(accruedInterest);
            borrowTime = block.timestamp;
        }
        IComet icomet = IComet(comet);
        IComet.AssetInfo memory info = icomet.getAssetInfoByAddress(asset);
        uint price = icomet.getPrice(info.priceFeed);
        uint assetDecimal = ITokenDecimals(asset).decimals();
        uint minRequireSupplyAmount = borrowed.mul(SCALE).mul(10**assetDecimal).mul(PRICE_MANTISA).div(price).div(uint(info.borrowCollateralFactor).sub(WITHDRAW_OFFSET));
        uint withdrawableAmount = supplied - minRequireSupplyAmount;
        require(withdrawAmount <= withdrawableAmount, "Exceeds asset supply");
        supplied = supplied.sub(withdrawAmount);
        bytes[] memory callData = new bytes[](1);
        bytes memory withdrawAssetCalldata = abi.encode(comet, address(this), asset, withdrawAmount);
        callData[0] = withdrawAssetCalldata;
        IBulker(bulker).invoke(buildWithdraw(), callData);
        require(IERC20(asset).transfer(_address, withdrawAmount), "Transfer Asset Failed");
    } 
    
    function borrowBalanceOf() public view returns (uint) {
        if(borrowed == 0) {
            return 0;
        }
        uint borrowAmount = borrowed;
        uint interest = calculateInterest(borrowAmount, borrowTime);
        return borrowAmount + interest;
    }

    function calculateInterest(uint borrowAmount, uint _borrowTime) public view returns (uint) {
        IComet icomet = IComet(comet);
        uint totalSecond = block.timestamp - _borrowTime;
        return borrowAmount.mul(icomet.getBorrowRate(icomet.getUtilization())).mul(totalSecond).div(1e18);
    }

    function getApr() public view returns (uint) {
        IComet icomet = IComet(comet);
        uint borowRate = icomet.getBorrowRate(icomet.getUtilization());
        return borowRate.mul(31536000);
    }

    function claimCReward() public {
        require(msg.sender == controller, "Cannot be called directly");
        ICometRewards(cometReward).claim(comet, address(this), true);
    }

    function buildBorrowAction() pure virtual public returns(bytes32[] memory) {
        bytes32[] memory actions = new bytes32[](2);
        actions[0] = ACTION_SUPPLY_ASSET;
        actions[1] = ACTION_WITHDRAW_ASSET;
        return actions;
    }
    function buildWithdraw() pure public returns(bytes32[] memory) {
        bytes32[] memory actions = new bytes32[](1);
        actions[0] = ACTION_WITHDRAW_ASSET;
        return actions;
    }
    function buildRepay() pure virtual public returns(bytes32[] memory) {
        bytes32[] memory actions = new bytes32[](2);
        actions[0] = ACTION_SUPPLY_ASSET;
        actions[1] = ACTION_WITHDRAW_ASSET;
        return actions;
    }
    function buildRepayBorrow() pure public returns(bytes32[] memory) {
        bytes32[] memory actions = new bytes32[](2);
        actions[0] = ACTION_SUPPLY_ASSET;
        return actions;
    }

    function getMintableToken(uint256 _usdcSupply, uint256 _mintedTUSD, uint256 _toMintTUSD) public view returns (uint256) {
        uint256 totalMintable = _usdcSupply.mul(LIQUIDATION_THRESHOLD)
            .mul(PRECISION)
            .mul(decimalAdjust)
            .div(LIQUIDATION_PRECISION)
            .div(MIN_HEALTH_FACTOR);
        require(totalMintable >= _mintedTUSD + _toMintTUSD, "User can not mint more TUSD");
        totalMintable -= _mintedTUSD;
        return totalMintable;
    }

    function getBurnableToken(uint256 _tUsdRepayAmount, uint256 tUSDBorrowAmount, uint256 _usdcToBePayed) public view returns (uint256) {
        require(tUSDBorrowAmount >= _tUsdRepayAmount, "You have not minted enough TUSD");
        if(tUSDBorrowAmount == 0){
            return _usdcToBePayed;
        }
        else{
            uint256 totalWithdrawableCollateral = _tUsdRepayAmount.mul(LIQUIDATION_PRECISION)
                .mul(MIN_HEALTH_FACTOR)
                .div(LIQUIDATION_THRESHOLD)
                .div(PRECISION)
                .div(decimalAdjust);
            require(totalWithdrawableCollateral <= _usdcToBePayed, "User cannot withdraw more collateral");
            return totalWithdrawableCollateral;
        }
    }
    
    receive() external payable {}
}
