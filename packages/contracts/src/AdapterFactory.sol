// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AaveV3MonadAdapter} from "./adapters/AaveV3MonadAdapter.sol";
import {CircleErrors} from "./libraries/CircleErrors.sol";

/// @title AdapterFactory
/// @notice Deploys per-circle AaveV3MonadAdapter instances on behalf of the
///         CircleFactory. Split out so the adapter creation bytecode lives in
///         this contract's runtime rather than inflating CircleFactory past
///         the EVM contract-size limit. Only the CircleFactory that deployed
///         this contract may use it; it holds no funds and no configuration.
contract AdapterFactory {
    address public immutable circleFactory;

    constructor(address circleFactory_) {
        circleFactory = circleFactory_;
    }

    function deployAdapter(address circle, address pool, address asset, address aToken)
        external
        returns (address adapter)
    {
        if (msg.sender != circleFactory) revert CircleErrors.NotAuthorized();
        adapter = address(new AaveV3MonadAdapter(circle, pool, asset, aToken));
    }
}
