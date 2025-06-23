import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi';

export default function Profile() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const coins = 0; // Replace with actual coin logic if needed

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
    </div>
  );
} 