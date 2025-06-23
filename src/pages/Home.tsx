import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, parseEther } from "ethers";
import NFTCard from "../components/NFTcard";
import "../index.css";
import { Alchemy, Network } from "alchemy-sdk";
import { checkNFTOwnership } from "../utils/checkNFTOwnership";
import Navbar from "../components/Navbar";


const config = {
  apiKey: "a3RjV4P8B-aBpyEcfKMEgwJ0hBEHTbwJ", // Paste your key here
  network: Network.ETH_SEPOLIA,   // Or the network you use
};
const alchemy = new Alchemy(config);

export async function ownsAnyERC721(address: string): Promise<string[]> {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  // Filter for ERC-721 NFTs
  const erc721s = nfts.ownedNfts.filter(nft => nft.tokenType === "ERC721");
  // Return contract addresses of owned ERC-721 NFTs
  return erc721s.map(nft => nft.contract.address);
}

const alchemyApiKey = 'a3RjV4P8B-aBpyEcfKMEgwJ0hBEHTbwJ';
const userAddress = '0x588F6b3169F60176c1143f8BaB47bCf3DeEbECdc';

async function checkOwnership() {
  const ownsNFT = await checkNFTOwnership(userAddress);
  if (ownsNFT) {
    alert('User owns the NFT!');
  } else {
    alert('User does NOT own the NFT.');
  }
}

export default function Home() {
  const navigate = useNavigate();
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

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const [address] = await window.ethereum.request({ method: "eth_requestAccounts" });
    const contracts = await ownsAnyERC721(address);

    if (contracts.length > 0) {
      // Optionally, save the contract addresses for your use
      // localStorage.setItem("userNFTContracts", JSON.stringify(contracts));
      navigate("/home");
    } else {
      alert("You must own at least one ERC-721 NFT to log in.");
    }
  };

  return (
    <div className="page modern-bg">
      <Navbar />
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
