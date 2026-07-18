// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @dev Test-only ERC-20 whose transfers can be switched to fail or skim fees.
contract FailingERC20 is ERC20 {
    bool public failTransfers;
    uint256 public feeBps; // fee-on-transfer simulation

    constructor() ERC20("Failing Token", "FAIL") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setFailTransfers(bool fail) external {
        failTransfers = fail;
    }

    function setFeeBps(uint256 bps) external {
        feeBps = bps;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (failTransfers) return false;
        if (feeBps > 0) {
            uint256 fee = (amount * feeBps) / 10_000;
            _burn(msg.sender, fee);
            return super.transfer(to, amount - fee);
        }
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (failTransfers) return false;
        if (feeBps > 0) {
            uint256 fee = (amount * feeBps) / 10_000;
            _spendAllowance(from, msg.sender, amount);
            _burn(from, fee);
            _transfer(from, to, amount - fee);
            return true;
        }
        return super.transferFrom(from, to, amount);
    }
}
