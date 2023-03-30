const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
require("dotenv").config()



// getNamedAccounts, deployments comes from HRE, when this call hardHat pass the Hre to it
module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

   

    let ethUsdPriceFeedAddress

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
   }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    let args=[ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

         if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
              await verify(fundMe.address,args)
         }


    log(`FundMe deployed at ${fundMe.address}`)

   
}

module.exports.tags=["all","fundme"]


