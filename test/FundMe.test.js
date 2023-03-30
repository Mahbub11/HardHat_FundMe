const { assert, expect } = require("chai");
const { Contract } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("500");

  beforeEach(async function () {
    // deploy our fundMe contract
    // using HardHat Deploy

    // const accounts= await ethers.getSigner();
    // const accountZero= accounts[0];    // get Named Account liken hardHat-> deployer

    // Deploying the Contract
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
      // NB: this is passing as because it's run in local network and in deploy/01
      // ethUsdPriceFeedAddress = ethUsdAggregator.address (the mocV3agg address is passing to the pricefeed address) so both adderess is same

      // Getting the priceFeed Address.
      new Promise((resolve) =>
        fundMe.priceFeed().then((value) => console.log(value))
      );
      // fundMe.priceFeed().then(value=> console.log(value));
      console.log(mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("will failed if Not enough amount provided", async function () {
      await expect(fundMe.fund({ value: 0 })).to.be.reverted;
    });
    it("amount funded", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);

      assert.equal(response.toString(), sendValue.toString());
    });

    it("Add funder to funders array", async function () {
      await fundMe.fund({ value: sendValue });

      // funders(0) as it act like solidity public variable
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
      console.log(funder);
      console.log(deployer);
    });
  });

  describe("Withdraw", async function () {
    it("withdraw ETH from a single funder", async function () {
      // Arrange

      const startingFunMedBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      console.log(
        "Starting FundMe BL: " + ethers.utils.formatEther(startingFunMedBalance)
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      console.log(
        "Deployer BL: " + ethers.utils.formatEther(startingDeployerBalance)
      );

      // Send FundMe contract BL
      console.log("Funding to FundMe Contract........");
      await fundMe.fund({ value: sendValue });
      await fundMe.addressToAmountFunded(deployer);

      const runningFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      console.log(
        "Running FundMe BL: " + ethers.utils.formatEther(runningFundMeBalance)
      );

      const runningDeployerBalance = await fundMe.provider.getBalance(deployer);
      console.log(
        "Running Deployer BL: " +
          ethers.utils.formatEther(runningDeployerBalance)
      );

      // Act
      console.log("withdraw the Balance.......");
      await fundMe.getContactFactory();
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = transactionReceipt;

      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      console.log(
        "Ending FundMe BL: " + ethers.utils.formatEther(endingFundMeBalance)
      );

      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);
      console.log(
        "Ending Deployer BL: " +
          ethers.utils.formatEther(endingDeployerBalance.add(gasCost))
      );

      //  Send FundMe Balance to the Deployer Account
      const deployerCurrentBL = endingDeployerBalance
        .add(endingFundMeBalance)
        .toString();
      console.log(
        "Deployer Current BL: " + ethers.utils.formatEther(deployerCurrentBL)
      );

      // Assert

      // assert.equal(startingDeployerBalance.toString(),
      // endingDeployerBalance.toString())
    });

    it("Only owner Can Withdraw the Fund", async function () {
      //NB: Here we will two different AC and try to verify the withDraw Function
      // Attatching a account to our contract
      const accounts = await ethers.getSigners();
      const contractAccountOne = await fundMe.connect(accounts[11]);
      console.log(contractAccountOne.signer.address);

      //  const withdraw=await contractAccount.withdraw();

      //Lets add some Fund with That connected AC
      console.log("Funding to FundMe Contract........");
      await contractAccountOne.fund({ value: sendValue });
      await fundMe.addressToAmountFunded(contractAccountOne.signer.address);

      //Lets get the Balance::
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      console.log(
        "Ending FundMe BL: " + ethers.utils.formatEther(endingFundMeBalance)
      );

      // Attatching Another account to our contract
      const accounts1 = await ethers.getSigners();
      const contractAccountTwo = await fundMe.connect(accounts[12]);
      console.log(contractAccountTwo.signer.address);

      //  const withdraw=await contractAccount.withdraw();
      //Lets add some Fund with That connected AC
      console.log("Funding to FundMe Contract........");
      await contractAccountTwo.fund({ value: sendValue });
      await fundMe.addressToAmountFunded(contractAccountTwo.signer.address);

      //Lets get the Balance::
      const endingFundMeBalance1 = await fundMe.provider.getBalance(
        fundMe.address
      );
      console.log(
        "Ending FundMe BL: " + ethers.utils.formatEther(endingFundMeBalance1)
      );

      // Finding the Funder who funded
      let funders = await fundMe.funders(1);
      console.log(funders);

      console.log("Contract Owner: " + fundMe.signer.address);

      // Let's Withdraw
      try {
        const withdraw = await contractAccountOne.withdraw();
      } catch (error) {
        console.log(error.message);
      }
    });
  });
});
