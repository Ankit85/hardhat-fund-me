const { network } = require("hardhat")
const {
    networkConfig,
    developementChains,
    DECIMAL,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //when going for local host or hardhat network we use mock

    if (chainId == 31337) {
        log("Local Network detected!!! Deployment Code 1337 Activated")
        const mockV3Interface = await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true,
        })
    }
    log("Mocks deployed!!!!!!!!!!")
    log("-".repeat(15))
}

module.exports.tags = ["all", "mocks"]
