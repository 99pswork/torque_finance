// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.19;
interface IBulker {
    function invoke(bytes32[] calldata actions, bytes[] calldata data) external payable ;
}