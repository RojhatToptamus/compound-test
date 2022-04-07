require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('dotenv').config();


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const alchemyApiKey = process.env.ALCHEMY_API_KEY;

module.exports = {
  solidity: "0.8.6",
  networks: {
    hardhat: {
      chainId:1337,
      forking: {
        url: "https://speedy-nodes-nyc.moralis.io/5c1cf4e3da1a8adb0e7be4e8/eth/mainnet/archive",
      }
    }
  }
};
