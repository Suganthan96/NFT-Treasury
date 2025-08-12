import Navbar from "../components/Navbar";
import MembershipDashboard from "../components/MembershipDashboard";
import DiscordAccess from "../components/DiscordAccess";
import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi';
import { useState } from "react";
import { BrowserProvider, parseEther } from "ethers";

export default function Profile() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [coins, setCoins] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<null | 'pending' | 'success' | 'error'>(null);

  const handleMembershipClick = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setTransactionStatus('pending');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      const membershipPrice = "0.0000001";
      const valueInWei = parseEther(membershipPrice);
      const provider = new BrowserProvider(window.ethereum);
      const gasLimitHex = "0x" + (300000).toString(16);

      // ✅ ethers v6 doesn't support getGasPrice(); use raw RPC call
      const gasPriceHex = await provider.send("eth_gasPrice", []);

      const transactionParameters = {
        to: '0x1F958d24298e04e8516EA972eFc2A3Bd50B4BF4F',
        from: accounts[0],
        value: valueInWei.toString(), // still a string, auto-handled by MetaMask
        gasLimit: gasLimitHex,
     // convert 300000 to hex string
        gasPrice: gasPriceHex          // already in hex string format
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction hash:', txHash);
      setTransactionStatus('success');
      setCoins(prev => prev + 1);
      setShowCoinAnimation(true);
      setTimeout(() => setShowCoinAnimation(false), 1000);

    } catch (error) {
      console.error('Transaction failed:', error);
      setTransactionStatus('error');
    }
  };

  const handleLogout = () => {
    navigate('/Login');
  };

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="user-info-container">
        <div className="user-avatar">
          <img src="user.png" alt="User" className="avatar-img" />
        </div>
        <div className="user-details">
          <p className="user-name">NFT Collector</p>
          <p className="wallet-address">{isConnected ? address : "Not connected"}</p>
          <div className="coin-counter">
            <span className="coin-icon">🪙</span>
            <span className="coin-count">{coins}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="content-wrapper">
        {/* Membership Dashboard */}
        <div style={{ marginBottom: '3rem' }}>
          <MembershipDashboard />
        </div>

        {/* Discord Access Section */}
        <div style={{ marginBottom: '3rem' }}>
          <DiscordAccess />
        </div>
        
        <div className="membership-section">
            <h2 className="membership-title">Become a Premium Member</h2>
            <p className="membership-description">
                Unlock exclusive features for just 0.0000001 ETH
            </p>

            {transactionStatus === 'pending' && (
                <div className="transaction-status pending">
                Processing transaction...
                </div>
            )}
            {transactionStatus === 'success' && (
                <div className="transaction-status success">
                Membership activated! +1 🪙
                </div>
            )}
            {transactionStatus === 'error' && (
                <div className="transaction-status error">
                Transaction failed. Please try again.
                </div>
            )}

            <button
                className="membership-button"
                onClick={handleMembershipClick}
                disabled={transactionStatus === 'pending'}
            >
                {transactionStatus === 'pending' ? 'Processing...' : 'Pay 0.0000001 ETH'}
            </button>

            {showCoinAnimation && (
                <div className="coin-animation">🪙</div>
            )}
        </div>
      </div>
    </div>
  );
}