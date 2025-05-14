import { BrowserProvider, parseEther, Contract } from "ethers";
import { memAddress } from "../constants/mem";
import memAbi from "../abi/memAbi.json"; // Import your contract ABI

export async function joinNow(): Promise<"success" | "error"> {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return "error";
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Option 1: Direct ETH transfer (simple but less secure)
    /*
    const tx = await signer.sendTransaction({
      to: memAddress,
      value: parseEther("0.01"),
      gasLimit: 100000, // Explicit gas limit
    });
    */

    // Option 2: Interact with contract properly (recommended)
    const contract = new Contract(memAddress, memAbi, signer);
    const tx = await contract.joinNow({
      value: parseEther("0.01"),
      gasLimit: 200000 // Higher limit for contract calls
    });

    const receipt = await tx.wait();
    
    if (!receipt.status) {
      throw new Error("Transaction reverted");
    }

    return "success";
  } catch (error) {
    console.error("joinNow failed:", error);
    
    // User rejected request
    if ((error as any).code === 4001) {
      alert("Transaction was rejected");
    } 
    // Insufficient funds
    else if ((error as any).code === 'INSUFFICIENT_FUNDS') {
      alert("Insufficient ETH for transaction");
    }
    // Other errors
    else {
      alert("Transaction failed. Please try again.");
    }
    
    return "error";
  }
}