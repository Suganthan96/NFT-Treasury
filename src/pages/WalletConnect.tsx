import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { checkNFTOwnership } from "../utils/checkNFTOwnership";
import "../WalletConnect.css";

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  // Watch for wallet connection and check NFT ownership
  const handleWalletConnection = async () => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    try {
      const balance = await checkNFTOwnership(address as string);
      console.log("🎯 NFT Balance from Contract:", balance);

      if (balance > 0) {
        navigate("/home");
      } else {
        alert("❌ Access Denied: You do not own the required NFT.");
      }
    } catch (err) {
      console.error("🚨 NFT check failed:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  // Effect to check NFT ownership when wallet is connected
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
