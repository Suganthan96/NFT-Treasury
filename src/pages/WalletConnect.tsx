import { useNavigate } from "react-router-dom";
import { checkNFTOwnership } from "../utils/checkNFTOwnership";
import "../WalletConnect.css";

const ConnectWallet = () => {
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      console.log("✅ Connected Wallet:", walletAddress);

      const balance = await checkNFTOwnership(walletAddress);
      console.log("🎯 NFT Balance from Contract:", balance);

      if (balance > 0) {
        navigate("/home");
      } else {
        alert("❌ Access Denied: You do not own the required NFT.");
      }
    } catch (err) {
      console.error("🚨 Wallet connection failed:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  return (
    <div className="gradient-background">
      <div className="last">
        <button onClick={connectWallet} className="button">
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default ConnectWallet;
