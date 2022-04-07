
const abiJson = require('../abis/compAbi.json');

const ethers = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');


// Your Ethereum wallet private key
const privateKey = 'df57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e';

const wallet = new ethers.Wallet(privateKey, provider);
const myWalletAddress = wallet.address;

// Main Net Contract for cETH (the supply process is different for cERC20 tokens)
const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';

const cEthContract = new ethers.Contract(contractAddress, abiJson, wallet);

const ethDecimals = 18; // Ethereum has 18 decimal places

const main = async function() {
  let ethBalance = +(await provider.getBalance(myWalletAddress)) / Math.pow(10, ethDecimals);
  console.log("My wallet's ETH balance:", ethBalance, '\n');

  console.log('Supplying ETH to the Compound Protocol...', '\n');
  // Mint some cETH by supplying ETH to the Compound Protocol
  let tx = await cEthContract.mint({value: ethers.utils.parseUnits('458', 'ether') });
  await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain

  console.log('cETH "Mint" operation successful.', '\n');
  

  const bal = await cEthContract.callStatic.balanceOfUnderlying(myWalletAddress);
  const balanceOfUnderlying = +bal / Math.pow(10, ethDecimals);

  console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying, '\n');

  let cTokenBalance = +(await cEthContract.callStatic.balanceOf(myWalletAddress)) / 1e8;

  console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');

  let exchangeRateCurrent = await cEthContract.callStatic.exchangeRateCurrent();
  exchangeRateCurrent = exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8);
  console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent, '\n');

  console.log('Redeeming the cETH for ETH...', '\n');

  console.log('Exchanging all cETH based on cToken amount...', '\n');
  tx = await cEthContract.redeem(cTokenBalance * 1e8);
  await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain


  cTokenBalance = +(await cEthContract.callStatic.balanceOf(myWalletAddress)) / 1e8;
  console.log("My wallet's cETH Token Balance:", cTokenBalance);

  ethBalance = +(await provider.getBalance(myWalletAddress)) / Math.pow(10, ethDecimals);
  console.log("My wallet's ETH balance:", ethBalance, '\n');
}

main().catch((err) => {
  console.error(err);
});