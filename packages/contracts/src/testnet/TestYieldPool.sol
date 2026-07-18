// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IAaveV3Pool} from "../interfaces/aave/IAaveV3Pool.sol";

/// @dev Open faucet interface for the labeled testnet demo token.
interface IMintable {
    function mint(address to, uint256 amount) external;
}

/// @title TestYieldAToken
/// @notice ============================================================
///         TESTNET DEMONSTRATION ONLY — NOT A REAL YIELD MARKET.
///         ============================================================
///         An Aave-style interest-bearing token that grows a holder's balance
///         over time at a FIXED, CONFIGURED demo rate using the same
///         scaled-balance model Aave V3 uses. It exists purely to demonstrate
///         MonSave's yield mechanics on a valueless testnet token. The
///         "interest" is paid from a real pre-funded tUSD reserve held by this
///         contract — it is not a real economic return and must never be shown
///         to users as a real APY or a real market.
contract TestYieldAToken {
    uint256 private constant BASE = 1e18;
    uint256 private constant YEAR = 365 days;

    address public immutable pool;
    IERC20 public immutable underlying;
    uint16 public immutable apyBps; // fixed demo rate, e.g. 500 = 5%
    uint256 public immutable startTime;

    mapping(address => uint256) public scaledBalance;

    constructor(address pool_, address underlying_, uint16 apyBps_) {
        pool = pool_;
        underlying = IERC20(underlying_);
        apyBps = apyBps_;
        startTime = block.timestamp;
        // let the pool move the reserve on withdrawals
        IERC20(underlying_).approve(pool_, type(uint256).max);
    }

    /// @notice Linear (simple-interest) index growth — plain and predictable
    ///         for a demo. index = 1e18 at t0, rising with elapsed time.
    function index() public view returns (uint256) {
        return BASE + (BASE * apyBps * (block.timestamp - startTime)) / (10_000 * YEAR);
    }

    /// @notice Underlying-denominated balance (principal + accrued demo interest).
    function balanceOf(address account) public view returns (uint256) {
        return (scaledBalance[account] * index()) / BASE;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        scaledBalance[to] += (amount * BASE) / index();
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == pool, "only pool");
        uint256 scaled = (amount * BASE) / index();
        uint256 bal = scaledBalance[from];
        // clamp rounding dust on a full withdrawal
        scaledBalance[from] = scaled >= bal ? 0 : bal - scaled;
    }
}

/// @title TestYieldPool
/// @notice ============================================================
///         TESTNET DEMONSTRATION ONLY — NOT AAVE, NOT A REAL MARKET.
///         ============================================================
///         Implements the minimal Aave V3 Pool interface (supply/withdraw) so
///         MonSave's real AaveV3MonadAdapter works against it unchanged. Deploy
///         ONLY on Monad Testnet, via the testnet demo deploy script, and never
///         reference it from any mainnet deployment. Every UI surface that shows
///         its yield must label it as simulated test yield.
contract TestYieldPool is IAaveV3Pool {
    using SafeERC20 for IERC20;

    TestYieldAToken public aToken;
    IERC20 public underlying;
    bool private _initialized;

    /// @param underlying_ the (valueless) testnet settlement token
    /// @param apyBps_ fixed demo rate in basis points (e.g. 500 = 5%)
    function init(address underlying_, uint16 apyBps_) external {
        require(!_initialized, "init");
        _initialized = true;
        underlying = IERC20(underlying_);
        aToken = new TestYieldAToken(address(this), underlying_, apyBps_);
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external override {
        require(asset == address(underlying), "asset");
        // principal goes to the aToken (which holds the reserve too)
        IERC20(asset).safeTransferFrom(msg.sender, address(aToken), amount);
        aToken.mint(onBehalfOf, amount);
    }

    function withdraw(address asset, uint256 amount, address to) external override returns (uint256) {
        require(asset == address(underlying), "asset");
        aToken.burn(msg.sender, amount);
        // pay principal + accrued demo interest from the aToken's real reserve
        IERC20(asset).safeTransferFrom(address(aToken), to, amount);
        return amount;
    }

    /// @notice Top up the demo interest reserve. On a mintable testnet token
    ///         this mints valueless tokens into the reserve; the yield is then
    ///         backed by tokens the reserve actually holds, mirroring how a real
    ///         market pays interest from borrowers.
    function fundReserve(uint256 amount) external {
        IMintable(address(underlying)).mint(address(aToken), amount);
    }
}
