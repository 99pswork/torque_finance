// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

//  _________  ________  ________  ________  ___  ___  _______
// |\___   ___\\   __  \|\   __  \|\   __  \|\  \|\  \|\  ___ \
// \|___ \  \_\ \  \|\  \ \  \|\  \ \  \|\  \ \  \\\  \ \   __/|
//     \ \  \ \ \  \\\  \ \   _  _\ \  \\\  \ \  \\\  \ \  \_|/__
//      \ \  \ \ \  \\\  \ \  \\  \\ \  \\\  \ \  \\\  \ \  \_|\ \
//       \ \__\ \ \_______\ \__\\ _\\ \_____  \ \_______\ \_______\
//        \|__|  \|_______|\|__|\|__|\|___| \__\|_______|\|_______|

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./../interfaces/IGMX.sol";
import "./../interfaces/IExchangeRouter.sol";
import "./../interfaces/IGMXV2ETH.sol";

abstract contract GMXV2ETH is Ownable, ReentrancyGuard, IGMXV2ETH {
    IERC20 public wethGMX;
    IERC20 public gmToken;
    IERC20 public usdcToken;
    address marketAddress;
    address depositVault;
    address withdrawalVault;
    
    IExchangeRouter public immutable gmxExchange;
    ISwapRouter public immutable swapRouter;
    
    // address private constant UNISWAP_V3_ROUTER = 0xC6962004f452bE9203591991D15f6b388e09E8D0;

    constructor(
        address _weth,
        address _gmxExchange,
        address _swapRouter, // 0xC6962004f452bE9203591991D15f6b388e09E8D0
        address _gmToken,
        address _usdcToken,
        address _depositVault,
        address _withdrawalVault
    ) Ownable(msg.sender) {
        wethGMX = IERC20(_weth);
        gmxExchange = IExchangeRouter(_gmxExchange);
        swapRouter = ISwapRouter(_swapRouter);
        gmToken = IERC20(_gmToken);
        usdcToken = IERC20(_usdcToken);
        depositVault = _depositVault;
        withdrawalVault = _withdrawalVault;
    }

    function deposit(uint256 _amount) public returns (uint256 gmTokenAmount) {
        // add controller
        gmxExchange.sendWnt(depositVault, _amount);
        IExchangeRouter.CreateDepositParams memory params = createDepositParams();
        wethGMX.transferFrom(msg.sender, address(this), _amount);
        wethGMX.approve(depositVault, _amount);
        gmxExchange.createDeposit{ value: _amount }(params);
        gmTokenAmount = gmToken.balanceOf(address(this));
    }

    function balanceOf(address _address) public returns (uint256 gmTokenAmount) {
        return gmToken.balanceOf(_address);
    }

    function withdraw(uint256 _amount) public returns (uint256 initialWethBalance, uint256 usdcAmount, uint256 totalWethAmount) {
        // add controller
        gmxExchange.sendTokens(address(gmToken), withdrawalVault, _amount);
        IExchangeRouter.CreateWithdrawalParams memory params = createWithdrawParams();
        gmToken.transferFrom(msg.sender, address(this), _amount);
        gmToken.approve(withdrawalVault, _amount);
        gmxExchange.createWithdrawal(params);
        initialWethBalance = wethGMX.balanceOf(address(this));
        usdcAmount = usdcToken.balanceOf(address(this));
        swapUSDCtoWETH(usdcAmount);
        uint256 postSwapWethBalance = wethGMX.balanceOf(address(this));
        totalWethAmount = postSwapWethBalance;
        wethGMX.transfer(msg.sender, totalWethAmount);
    }

    function _sendWnt(address _receiver, uint256 _amount) private {
        gmxExchange.sendWnt(_receiver, _amount);
    }

    function _sendTokens(address _token, address _receiver, uint256 _amount) private {
        gmxExchange.sendTokens(_token, _receiver, _amount);
    }

    function createDepositParams() internal view returns (IExchangeRouter.CreateDepositParams memory) {
        IExchangeRouter.CreateDepositParams memory depositParams;
        depositParams.callbackContract = address(this);
        depositParams.callbackGasLimit = 0;
        depositParams.executionFee = 0;
        depositParams.initialLongToken = address(wethGMX);
        depositParams.initialShortToken = address(usdcToken);
        depositParams.market = marketAddress;
        depositParams.shouldUnwrapNativeToken = true;
        depositParams.receiver = address(this);
        depositParams.minMarketTokens = 0;
        return depositParams;
    }

    function createWithdrawParams() internal view returns (IExchangeRouter.CreateWithdrawalParams memory) {
        IExchangeRouter.CreateWithdrawalParams memory withdrawParams;
        withdrawParams.callbackContract = address(this);
        withdrawParams.callbackGasLimit = 0;
        withdrawParams.executionFee = 0;
        // withdrawParams.initialLongToken = address(weth);
        // withdrawParams.initialShortToken = address(usdcToken);
        withdrawParams.market = marketAddress;
        withdrawParams.shouldUnwrapNativeToken = true;
        withdrawParams.receiver = address(this);
        withdrawParams.minLongTokenAmount = 0;
        withdrawParams.minShortTokenAmount = 0;
        return withdrawParams;
    }

    function swapUSDCtoWETH(uint256 usdcAmount) internal {
        usdcToken.approve(address(swapRouter), usdcAmount);
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdcToken),
                tokenOut: address(wethGMX),
                fee: 500, // Uniswap V3 0.05 ETH/USDC pool
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: usdcAmount,
                amountOutMinimum: 99,
                sqrtPriceLimitX96: 0
            });

        swapRouter.exactInputSingle(params);
    }
}
