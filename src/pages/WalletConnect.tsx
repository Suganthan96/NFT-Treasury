import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Alchemy, Network } from "alchemy-sdk";
import "../WalletConnect.css";

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(config);

async function ownsAnyERC721(address: string): Promise<boolean> {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  // Filter for ERC-721 NFTs
  const erc721s = nfts.ownedNfts.filter(nft => nft.tokenType === "ERC721");
  return erc721s.length > 0;
}

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleWalletConnection = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    try {
      const ownsNFT = await ownsAnyERC721(address as string);
      if (ownsNFT) {
        navigate("/home");
      } else {
        alert("❌ Access Denied: You do not own any ERC-721 NFT.");
      }
    } catch (err) {
      console.error("🚨 NFT check failed:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  if (isConnected && address) {
    handleWalletConnection();
  }

  return (
    <div className="gradient-background">
      <div className="last">
        <button onClick={handleWalletConnection} className="button">
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default ConnectWallet;
