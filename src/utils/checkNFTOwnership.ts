import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants/contract";

export async function checkNFTOwnership(walletAddress: string): Promise<number> {
  if (!window.ethereum) {
    throw new Error("Ethereum provider is not available in the browser.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const balance = await contract.getERC721Balance(NFT_CONTRACT_ADDRESS, walletAddress);
  return Number(balance); // Ensures it's usable in comparison
}