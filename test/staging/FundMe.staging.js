const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developementChains } = require("../../helper-hardhat-config")

developementChains.includes(network.name)
    ? describe.skip("")
    : describe("FundMe", function () {
          let fundMe, deployer
          let sendValue = ethers.utils.parseEther("5")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to send and withdraw ", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
