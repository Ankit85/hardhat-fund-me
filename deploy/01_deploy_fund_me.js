const { network } = require("hardhat")
const { verifyContract } = require("../utils/verify")
const {
    networkConfig,
    developementChains,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    //when going for local host or hardhat network we use mock

    let ethUSDPriceFeedAddress

    if (developementChains.includes(network.name)) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUSDAggregator.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    }

    const args = [ethUSDPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-".repeat(15))

    if (!developementChains.includes(network.name)) {
        await verifyContract(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
