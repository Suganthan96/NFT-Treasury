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
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your NFT collection and account settings</p>
        </div>

        {/* User Profile Card */}
        <div className="user-profile-card">
          <div className="profile-avatar-section">
            <div className="avatar-container">
              <img src="user.png" alt="User Avatar" className="user-avatar" />
              <div className="avatar-status online"></div>
            </div>
            <button className="change-avatar-btn">
              <span className="camera-icon">📷</span>
              Change Avatar
            </button>
          </div>

          <div className="profile-info-section">
            <div className="user-details">
              <h2 className="user-name">NFT Collector</h2>
              <p className="user-title">Digital Asset Enthusiast</p>
              
              <div className="wallet-info">
                <div className="wallet-status">
                  <span className="status-indicator connected"></span>
                  <span className="status-text">
                    {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                  </span>
                </div>
                {isConnected && address && (
                  <div className="wallet-address-display">
                    <span className="address-label">Address:</span>
                    <code className="wallet-address">{address}</code>
                    <button className="copy-address-btn" title="Copy address">
                      📋
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-icon">🪙</div>
                <div className="stat-content">
                  <span className="stat-value">{coins}</span>
                  <span className="stat-label">Coins</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">🎨</div>
                <div className="stat-content">
                  <span className="stat-value">12</span>
                  <span className="stat-label">NFTs</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <span className="stat-value">Level 5</span>
                  <span className="stat-label">Rank</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="edit-profile-btn">
                <span className="edit-icon">✏️</span>
                Edit Profile
              </button>
              <button onClick={handleLogout} className="logout-button">
                <span className="logout-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Membership Section */}
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">👑</span>
                Membership Status
              </h3>
            </div>
            
            <div className="membership-card">
              <div className="membership-info">
                <h4>Premium Membership</h4>
                <p>Unlock exclusive features and benefits</p>
                
                {transactionStatus === 'pending' && (
                  <div className="transaction-status pending">
                    <div className="loading-spinner"></div>
                    Processing transaction...
                  </div>
                )}
                {transactionStatus === 'success' && (
                  <div className="transaction-status success">
                    <span className="success-icon">✅</span>
                    Membership activated! +1 🪙
                  </div>
                )}
                {transactionStatus === 'error' && (
                  <div className="transaction-status error">
                    <span className="error-icon">❌</span>
                    Transaction failed. Please try again.
                  </div>
                )}
              </div>

              <div className="membership-pricing">
                <div className="price-display">
                  <span className="price-amount">0.0000001</span>
                  <span className="price-currency">ETH</span>
                </div>
                
                <button
                  className="membership-upgrade-btn"
                  onClick={handleMembershipClick}
                  disabled={transactionStatus === 'pending'}
                >
                  {transactionStatus === 'pending' ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="upgrade-icon">⚡</span>
                      Upgrade Now
                    </>
                  )}
                </button>
              </div>

              {showCoinAnimation && (
                <div className="coin-animation">🪙</div>
              )}
            </div>
          </div>

          {/* Dashboard Sections */}
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">📊</span>
                Membership Dashboard
              </h3>
            </div>
            <div className="dashboard-wrapper">
              <MembershipDashboard />
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">💬</span>
                Discord Access
              </h3>
            </div>
            <div className="discord-wrapper">
              <DiscordAccess />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🕐</span>
                Recent Activity
              </h3>
            </div>
            
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon mint">🎨</div>
                <div className="activity-content">
                  <p className="activity-title">Minted new NFT</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
                <div className="activity-status success">✅</div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon trade">💰</div>
                <div className="activity-content">
                  <p className="activity-title">Purchased membership</p>
                  <p className="activity-time">1 day ago</p>
                </div>
                <div className="activity-status success">✅</div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon wallet">🔗</div>
                <div className="activity-content">
                  <p className="activity-title">Connected wallet</p>
                  <p className="activity-time">3 days ago</p>
                </div>
                <div className="activity-status success">✅</div>
              </div>
            </div>
          </div>

          {/* NFT Collection Preview */}
          <div className="profile-section">
            <div className="section-header">
              <h3 className="section-title">
                <span className="section-icon">🖼️</span>
                My NFT Collection
              </h3>
              <button className="view-all-btn">View All</button>
            </div>
            
            <div className="nft-grid">
              <div className="nft-card-mini">
                <img src="nft1.png" alt="NFT 1" />
                <p className="nft-name">Cyber Punk #001</p>
              </div>
              <div className="nft-card-mini">
                <img src="nft2.png" alt="NFT 2" />
                <p className="nft-name">Digital Art #042</p>
              </div>
              <div className="nft-card-mini">
                <img src="nft3.png" alt="NFT 3" />
                <p className="nft-name">Pixel Art #123</p>
              </div>
              <div className="nft-card-mini add-nft">
                <div className="add-icon">+</div>
                <p className="add-text">Create New NFT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}