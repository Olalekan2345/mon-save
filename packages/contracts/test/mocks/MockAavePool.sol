// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IAaveV3Pool} from "../../src/interfaces/aave/IAaveV3Pool.sol";

/// @dev Test-only 1:1 aToken. NEVER deployed publicly.
contract MockAToken is ERC20 {
    address public pool;
    IERC20 public underlying;

    constructor(address pool_, address underlying_) ERC20("Mock aToken", "maTOK") {
        pool = pool_;
        underlying = IERC20(underlying_);
        underlying.approve(pool_, type(uint256).max);
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        _burn(from, amount);
    }
}

/// @dev Test-only minimal Aave V3 pool: 1:1 supply/withdraw, underlying custody
///      at the aToken address (mirrors real Aave). NEVER deployed publicly.
contract MockAavePool is IAaveV3Pool {
    using SafeERC20 for IERC20;

    MockAToken public aToken;
    IERC20 public underlying;

    function init(address underlying_) external {
        underlying = IERC20(underlying_);
        aToken = new MockAToken(address(this), underlying_);
    }

    function supply(address asset_, uint256 amount, address onBehalfOf, uint16) external override {
        require(asset_ == address(underlying), "wrong asset");
        IERC20(asset_).safeTransferFrom(msg.sender, address(aToken), amount);
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(address asset_, uint256 amount, address to) external override returns (uint256) {
        require(asset_ == address(underlying), "wrong asset");
        aToken.burn(msg.sender, amount);
        // pull underlying custody from the aToken contract
        IERC20(asset_).safeTransferFrom(address(aToken), to, amount);
        return amount;
    }
}
