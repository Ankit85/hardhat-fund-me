const { run } = require("hardhat")
async function verifyContract(contractAddress, args) {
    console.log("Verifying contract...")
    try {
        //here 1st verify is keyword and 2nd is the task which verify has to do
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log(error)
        }
    }
}

module.exports = {
    verifyContract,
}
