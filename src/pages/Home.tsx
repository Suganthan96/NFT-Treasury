import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NFTCard from "../components/NFTcard";
import "../index.css";

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<null | 'pending' | 'success' | 'error'>(null);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };
    
    fetchWalletAddress();
  }, []);

  const handleMembershipClick = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      setTransactionStatus('pending');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      const membershipPrice = 0.0000001;
      const valueInWei = membershipPrice * 1e18;
      const hexValue = '0x' + valueInWei.toString(16);

      const transactionParameters = {
        to: '0xa9493e5232f0b27e9fdb4b2ded35fc8abb891bec',
        from: accounts[0],
        value: hexValue,
        gas: '0x' + (300000).toString(16)
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction hash:', txHash);
      setTransactionStatus('success');
      setCoins(coins + 1);
      setShowCoinAnimation(true);
      setTimeout(() => setShowCoinAnimation(false), 1000);

    } catch (error) {
      console.error('Transaction failed:', error);
      setTransactionStatus('error');
    }
  };

  const handleLogout = () => {
    // Clear wallet connection and redirect to login
    setWalletAddress(null);
    navigate('/Login');
  };

  return (
    <div className="page" style={{ 
      backgroundImage: "url('n.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh"
    }}>
      <div className="user-info-container">
        <div className="user-avatar">
          <img src="user.png" alt="User" className="avatar-img" />
        </div>
        <div className="user-details">
          <p className="user-name">NFT Collector</p>
          <p className="wallet-address">{walletAddress || "Not connected"}</p>
          <div className="coin-counter">
            <span className="coin-icon">🪙</span>
            <span className="coin-count">{coins}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="content-wrapper">
        <h1 className="home-title">Welcome to the NFT Hub</h1>

        <div className="nft-grid">
          <NFTCard title="Quarterback Edition" image="/nft1.png" />
          <NFTCard title="Hail Mary Pass" image="/nft2.png" />
          <NFTCard title="Hail Mary Pass" image="/nft3.png" />
          <NFTCard title="The Line of Scrimmage" image="/nft4.png" />
          <NFTCard title="The Lombardi Trophy" image="/nft5.png" />
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