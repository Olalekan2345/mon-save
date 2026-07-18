// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface IReenterTarget {
    function settleRound() external;

    function claimYield() external;
}

/// @dev Test-only ERC-20 that attempts to re-enter the circle during transfer.
contract ReentrantToken is ERC20 {
    address public target;
    uint8 public mode; // 0 = off, 1 = settleRound, 2 = claimYield
    bool internal _entered;

    constructor() ERC20("Reentrant Token", "REENT") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setAttack(address target_, uint8 mode_) external {
        target = target_;
        mode = mode_;
    }

    function _update(address from, address to, uint256 amount) internal override {
        super._update(from, to, amount);
        if (mode != 0 && target != address(0) && !_entered) {
            _entered = true;
            if (mode == 1) IReenterTarget(target).settleRound();
            else if (mode == 2) IReenterTarget(target).claimYield();
            _entered = false;
        }
    }
}
