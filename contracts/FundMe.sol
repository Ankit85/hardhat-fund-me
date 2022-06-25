//SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//error code
error FundMe__NotOwner();
error FundMe__Not_Enough_Money_In_Wallet();

//Interface, Library, Contracts

/// @title A Smart Contract for Crowd Funding Using Chainlink Node
/// @author Ankit Vishwakarma
/// @notice This Contract is to demo a sample funding contract
/// @dev Using Chainlink node to convert ETH to USD

contract FundMe {
    //Type Declaration
    using PriceConverter for uint256;

    //State Variables
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    uint256 public constant MINIMUM_USD = 50 * 1e18; //fund fn to add fund to contract
    address public immutable i_owner;

    modifier onlyOwner() {
        // require(msg.sender == owner ,"Only owner can call the function");
        // to make gas efficient using if with custom error
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // function order:
    // Constructor
    // recieve
    // fallback
    // external
    // public
    // internal
    // private
    // view / pure
    constructor(address s_priceFeedAdddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAdddress);
    }

    receive() external payable {
        console.log("calling recieve function");
        fund();
    }

    fallback() external payable {
        console.log("calling fallback function");
        fund();
    }

    ///   @dev This Function takes the Funds to the Smart Contract Address
    ///         Also, maps the funder and their address to s_addressToAmountFunded

    function fund() public payable {
        /* require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't have enough money in wallet"
        ); */
        /// @notice: msg.value.getConversionRate(s_priceFeed) === getConversion(msg.value, s_priceFeed)

        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__Not_Enough_Money_In_Wallet();
        }

        msg.value.getConversionRate(s_priceFeed);
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    /// @notice This Function withdraws the Smart Contract Balance to Owner Address Only

    /*  function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmountFunded[funder] = 0;

            s_funders = new address[](0);
            (bool success, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
            require(success, "Call Failed");
        }
    } */

    //writing cheaperwithdraw function by copying the storage value to a temp val in memory varible and the updating

    function withdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;

            s_funders = new address[](0);
            (bool success, ) = i_owner.call{value: address(this).balance}("");
            require(success, "Call Failed");
        }
    }

    // getter function of owner, funders, AddresstoAmountFunded

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(address fundersAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundersAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
