const { ethers } = require("ethers");
const dotenv = require("dotenv");
dotenv.config();

const bridgeAbi = require("../abis/bridgeContractABI"); // Import ABI from JS file

const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BRIDGE_CONTRACT_ADDRESS = process.env.BRIDGE_CONTRACT_ADDRESS;

const provider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
);

const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const bridgeContract = new ethers.Contract(
  // Create contract instance
  BRIDGE_CONTRACT_ADDRESS,
  bridgeAbi,
  wallet
);

async function sendTransaction(
  tokenAddress,
  amount,
  destinationChainId,
  toAddress
) {
  try {
    // fix of error with addresses in string type
    const formattedToAddress = ethers.utils.hexZeroPad(
      ethers.utils.hexlify(
        ethers.utils.stripZeros(ethers.utils.arrayify(toAddress))
      ),
      32
    );

    // Estimate Gas
    const gasEstimate = await bridgeContract.estimateGas.sendFrom(
      wallet.address,
      destinationChainId,
      formattedToAddress, // Use bytes32 to fix an error
      amount,
      0, // _minAmount
      {
        refundAddress: wallet.address, // Refund address
        zroPaymentAddress: ethers.constants.AddressZero, // ZRO payment address
        adapterParams: ethers.utils.hexlify([]), // Adapter params
      },
      {
        value: ethers.utils.parseEther("0.01"), // Gas fee
      }
    );

    // Send Transaction (the same as estimate gas function)
    const tx = await bridgeContract.sendFrom(
      wallet.address,
      destinationChainId,
      formattedToAddress,
      amount,
      0,
      {
        refundAddress: wallet.address,
        zroPaymentAddress: ethers.constants.AddressZero,
        adapterParams: ethers.utils.hexlify([]),
      },
      {
        gasLimit: gasEstimate,
        value: ethers.utils.parseEther("0.01"),
      }
    );

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
}

sendTransaction(
  "", // Token address SKYA - 0x623cD3a3EdF080057892aaF8D773Bbb7A5C9b6e9
  ethers.utils.parseUnits("1.0", 18), // Amount to send (18 decimal places)
  8453, // Destination chain ID (Base network)
  "0xAddress" // Receiver address ()
);
