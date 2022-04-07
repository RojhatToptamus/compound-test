//import '../contracts/MyContract.sol';
const { ethers } = require("hardhat")
const hre = require("hardhat")
const BN = require("bn.js")

async function mineBlocks(amount) {
  for (let i = 0; i < amount; i++) {
    await hre.network.provider.send("evm_mine")
  }
  console.log("EVM time ${amount} seconds increased")
}
async function increaseTime(amount) {
  await hre.network.provider.send("evm_increaseTime", [amount])
  console.log("${amount} blocks mined")
}


let myContract;
let myContractAddress;
let IERC20;
let CErc20;
let TestCompoundEth;
let provider;
let signer;
const ethDecimals = 18; // Ethereum has 18 decimal places
let cEthContractAddress;
let abiJson;
let cEthContract;
let signerAddress;

describe("Deployer", function () {
    before('deploy contracts', async function () {
        provider = new ethers.providers.JsonRpcProvider('http://localhost:8545/');
        signer = provider.getSigner();
        signerAddress = signer.getAddress()
        console.log(
        "Deploying contracts with the account:",
        signerAddress
        );

        console.log("Account balance:", (await signer.getBalance()).toString())

        // Deploy Token Contract
        const MyContract = await hre.ethers.getContractFactory('MyContract')
        myContract = await MyContract.deploy()
        
        myContractAddress = myContract.address
        await myContract.deployed()
        console.log("MyContract deployed at: " + myContractAddress)

        // Main Net Contract for cETH (the supply process is different for cERC20 tokens)
        cEthContractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
        abiJson = require('../abis/compAbi.json');
        cEthContract = new ethers.Contract(cEthContractAddress, abiJson, signer);
        

        // Get current balancec
        let ethWeiBalance = await provider.getBalance(signerAddress);
        const ethValue = ethers.utils.formatEther(ethWeiBalance);
        console.log("My wallet's ETH balance:", ethValue, '\n');
    
    });

     // Mint some cETH by supplying ETH to the Compound Protocol
    it('supplies eth to the compound protocol', async function () {
        console.log('Supplying ETH to the Compound Protocol...', '\n');
        
      
        let tx = await myContract.supplyEthToCompound('0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5', { value: ethers.utils.parseEther('100', 'ether') });
        await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
        console.log('cETH "Mint" (100) operation successful.', '\n');

        const bal = await cEthContract.callStatic.balanceOfUnderlying(signerAddress);

        const balanceOfUnderlying = ethers.utils.formatEther(bal)
        console.log("ETH supplied to the Compound Protocol:", balanceOfUnderlying, '\n');

        let cTokenBalance = +(await cEthContract.callStatic.balanceOf(signerAddress)) / 1e8;
        console.log("My wallet's cETH Token Balance:", cTokenBalance, '\n');
    });

    it('manupulates the time', async function(){
            console.log('mining 10000 blocks')
            mineBlocks(10000000)
            console.log('10000 blocks mined')
    }); 

    it('redeem eth from compound protocol', async function () {
        console.log('Redeeming ETH to the Compound Protocol...', '\n');
         let cTokenBalance = +(await cEthContract.callStatic.balanceOf(signerAddress)) / 1e8
       /* let exchangeRateCurrent = await cEthContract.callStatic.exchangeRateCurrent();
        exchangeRateCurrent = exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8);
        console.log("Current exchange rate from cETH to ETH:", exchangeRateCurrent, '\n'); */
    
        console.log('Redeeming the cETH for ETH...', '\n');
        console.log('Exchanging all cETH based on cToken amount...', '\n');

    
        let val = ethers.BigNumber.from(ethers.utils.parseEther('100', 'ether'));
        //parametreye gerek yok
        tx = await myContract.redeemCEth(val, true,cEthContractAddress);
        await tx.wait(1); // wait until the transaction has 1 confirmation on the blockchain
    
    
        cTokenBalance = +(await cEthContract.callStatic.balanceOf(signerAddress)) / 1e8;
        console.log("My wallet's cETH Token Balance:", cTokenBalance);
        console.log('Contract '+ await provider.getBalance(myContractAddress));
        ethBalance = +(await provider.getBalance(signerAddress)) / Math.pow(10, ethDecimals);
       
        console.log("My wallet's ETH balance:", ethBalance, '\n');

    });



});