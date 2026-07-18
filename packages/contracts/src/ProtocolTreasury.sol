// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title ProtocolTreasury
/// @notice Receives only earned protocol yield fees. It can never receive or
///         withdraw user principal — circles only ever transfer realized fee
///         amounts here. Owner is intended to be a Safe multisig.
contract ProtocolTreasury is Ownable2Step {
    using SafeERC20 for IERC20;

    event TreasuryWithdrawal(address indexed token, address indexed to, uint256 amount);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert CircleErrors.ZeroAddress();
        IERC20(token).safeTransfer(to, amount);
        emit TreasuryWithdrawal(token, to, amount);
    }
}
