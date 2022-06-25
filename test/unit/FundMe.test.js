const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developementChains } = require("../../helper-hardhat-config")

!developementChains.includes(network.name)
    ? describe.skip("")
    : describe("FundMe", function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer

              //it will run deploy folder and takes the tag as parameter ==> its hardhat-deploy feature
              await deployments.fixture(["all"])

              //getContract returns the latest contract deployed
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor", function () {
              // Checking Aggregator is Set Correctly
              it("set the aggregator correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert(response, mockV3Aggregator.address)
              })
          })

          describe("fund", function () {
              //checking when users failing fail to send 1Eth to contract
              it("fails if you don't send enough eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "FundMe__Not_Enough_Money_In_Wallet"
                  )
              })

              //checking when users failing fail to send 1Eth to contract
              it("upadated the amount funded data structure", async function () {
                  //adding ETH to contract by passing it to fund()
                  await fundMe.fund({ value: sendValue })
                  const addressToAmountFunded =
                      await fundMe.getAddressToAmountFunded(deployer)
                  assert.equal(
                      addressToAmountFunded.toString(),
                      sendValue.toString()
                  )
              })

              //Checking after Transaction funder is added to Blockchain
              it("Adds funders to funder's array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = fundMe.getFunder(0)
                  assert(funder, deployer)
              })
          })

          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdrawl ETH from single Funder's", async function () {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const txnResponse = await fundMe.withdraw()
                  const txnReciept = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //checking the balnce of contract after withdrawing ETH
                  assert(endingFundMeBalance, 0)

                  //checking the balance of deployer after withdrawing ETH from Contract
                  assert(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw  Multiple Funder's", async function () {
                  const accounts = await ethers.getSigners()

                  for (let i = 1; i < 7; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const txnResponse = await fundMe.withdraw()
                  const txnReciept = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //checking the balnce of contract after withdrawing ETH
                  assert(endingFundMeBalance, 0)

                  //checking the balance of deployer after withdrawing ETH from Contract
                  assert(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //making sure that funders are set to 0
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 7; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only owner can withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )

                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("allows us to cheaper withdraw  Multiple Funder's", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 7; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const txnResponse = await fundMe.cheaperWithdraw()
                  const txnReciept = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //checking the balnce of contract after withdrawing ETH
                  assert(endingFundMeBalance, 0)

                  //checking the balance of deployer after withdrawing ETH from Contract
                  assert(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //making sure that funders are set to 0
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 7; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }

                  console.log("making sure that funders are set to 0")
              })

              it("Cheaper Withdrawl ETH from single Funder's", async function () {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  const txnResponse = await fundMe.cheaperWithdraw()
                  const txnReciept = await txnResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = txnReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //checking the balnce of contract after withdrawing ETH
                  assert(endingFundMeBalance, 0)

                  //checking the balance of deployer after withdrawing ETH from Contract
                  assert(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
          })
      })
