//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //getPrice
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e18);
    }

    //getConversionRate
    function getConversionRate(
        uint256 etherAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 etherPrice = getPrice(priceFeed);
        uint256 etherToUSD = (etherPrice * etherAmount) / 1e18;
        return etherToUSD;
    }
}
