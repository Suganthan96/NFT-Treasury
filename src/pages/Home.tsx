import ChromaGrid, { ChromaItem } from "../components/NFTcard";
import MembershipGatedFeature from "../components/MembershipGatedFeature";
import "../index.css";
import { Alchemy, Network } from "alchemy-sdk";
import Navbar from "../components/Navbar";
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import contractABI from '../abi/abi.json';
import { useMembershipNFTs } from '../hooks/useNFTCount';

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(config);

// Use the correct contract address for minting
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xd92c6FFB0f70B85AeD6eAA72DBaf149263ebD40f';

export async function ownsAnyERC721(address: string): Promise<string[]> {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  // Filter for ERC-721 NFTs
  const erc721s = nfts.ownedNfts.filter(nft => nft.tokenType === "ERC721");
  // Return contract addresses of owned ERC-721 NFTs
  return erc721s.map(nft => nft.contract.address);
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { nftCount } = useMembershipNFTs();
  const [isBuying, setIsBuying] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<string>('');

  const { writeContract, isSuccess, data: txData, error } = useWriteContract();

  const handleBuyNFT = async (nftTitle: string, nftImage: string, price: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    
    setIsBuying(true);
    setSelectedNFT(nftTitle);
    
    try {
      // Create metadata for the NFT
      const metadata = {
        name: nftTitle,
        description: `Premium ${nftTitle} NFT from the NFL collection - Price: ${price} ETH`,
        image: nftImage,
        attributes: [
          { trait_type: "Collection", value: "NFL Premium" },
          { trait_type: "Price", value: `${price} ETH` },
          { trait_type: "Rarity", value: "Legendary" }
        ],
      };
      
      // Upload metadata to Pinata
      const metaRes = await fetch('http://localhost:3001/api/pinata-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      
      if (!metaRes.ok) throw new Error('Failed to upload metadata to Pinata');
      
      const metaData = await metaRes.json();
      const metaCID = metaData.IpfsHash;
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaCID}`;

      // Mint NFT on blockchain (this simulates a purchase by minting the NFT)
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'mint',
        args: [address as string, tokenURI],
        chainId: 11155111, // Sepolia
      });

      alert(`Successfully purchased ${nftTitle} for ${price} ETH!`);

    } catch (err) {
      const error = err as Error & { reason?: string };
      alert('Purchase failed: ' + (error.reason || error.message));
    } finally {
      setIsBuying(false);
      setSelectedNFT('');
    }
  };

  // NFT card data
  const nftCards: ChromaItem[] = [
    {
      title: "Quarterback Edition",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg,#4F46E5,#000)",
      price: "0.5",
      onBuy: () => handleBuyNFT("Quarterback Edition", "/nft1.png", "0.5"),
    },
    {
      title: "Hail Mary Pass",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg,#10B981,#000)",
      price: "0.3",
      onBuy: () => handleBuyNFT("Hail Mary Pass", "/nft2.png", "0.3"),
    },
    {
      title: "End Zone Elite",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg,#F59E0B,#000)",
      price: "0.7",
      onBuy: () => handleBuyNFT("End Zone Elite", "/nft3.png", "0.7"),
    },
    {
      title: "The Line of Scrimmage",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg,#EF4444,#000)",
      price: "0.4",
      onBuy: () => handleBuyNFT("The Line of Scrimmage", "/nft4.png", "0.4"),
    },
    {
      title: "The Lombardi Trophy",
      subtitle: "NFL NFT",
      image: "/nft5.png",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg,#8B5CF6,#000)",
      price: "1.2",
      onBuy: () => handleBuyNFT("The Lombardi Trophy", "/nft5.png", "1.2"),
    },
    {
      title: "Gridiron Glory",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg,#06B6D4,#000)",
      price: "0.6",
      onBuy: () => handleBuyNFT("Gridiron Glory", "/nft1.png", "0.6"),
    },
    {
      title: "Touchdown Titan",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#F472B6",
      gradient: "linear-gradient(120deg,#F472B6,#000)",
      price: "0.8",
      onBuy: () => handleBuyNFT("Touchdown Titan", "/nft2.png", "0.8"),
    },
    {
      title: "Blitz Brigade",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#34D399",
      gradient: "linear-gradient(160deg,#34D399,#000)",
      price: "0.35",
      onBuy: () => handleBuyNFT("Blitz Brigade", "/nft3.png", "0.35"),
    },
    {
      title: "Pigskin Prodigy",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#FBBF24",
      gradient: "linear-gradient(200deg,#FBBF24,#000)",
      price: "0.45",
      onBuy: () => handleBuyNFT("Pigskin Prodigy", "/nft4.png", "0.45"),
    },
    {
      title: "Field General",
      subtitle: "NFL NFT",
      image: "/nft5.png",
      borderColor: "#60A5FA",
      gradient: "linear-gradient(180deg,#60A5FA,#000)",
      price: "0.9",
      onBuy: () => handleBuyNFT("Field General", "/nft5.png", "0.9"),
    },
    {
      title: "Red Zone Ruler",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#A78BFA",
      gradient: "linear-gradient(140deg,#A78BFA,#000)",
      price: "0.55",
      onBuy: () => handleBuyNFT("Red Zone Ruler", "/nft1.png", "0.55"),
    },
    {
      title: "Superbowl Star",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#F87171",
      gradient: "linear-gradient(170deg,#F87171,#000)",
      price: "1.5",
      onBuy: () => handleBuyNFT("Superbowl Star", "/nft2.png", "1.5"),
    },
  ];

  // Premium NFTs for Silver+ members
  const premiumNftCards: ChromaItem[] = [
    {
      title: "Legendary Champion",
      subtitle: "Exclusive NFL NFT",
      image: "/nft1.png",
      borderColor: "#9333EA",
      gradient: "linear-gradient(145deg,#9333EA,#000)",
      price: "2.5",
      onBuy: () => handleBuyNFT("Legendary Champion", "/nft1.png", "2.5"),
    },
    {
      title: "Hall of Fame Hero",
      subtitle: "Ultra-Rare NFL NFT", 
      image: "/nft3.png",
      borderColor: "#DC2626",
      gradient: "linear-gradient(145deg,#DC2626,#000)",
      price: "3.0",
      onBuy: () => handleBuyNFT("Hall of Fame Hero", "/nft3.png", "3.0"),
    },
    {
      title: "Championship Ring",
      subtitle: "Diamond NFL NFT",
      image: "/nft5.png",
      borderColor: "#0891B2", 
      gradient: "linear-gradient(145deg,#0891B2,#000)",
      price: "5.0",
      onBuy: () => handleBuyNFT("Championship Ring", "/nft5.png", "5.0"),
    }
  ];

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <h1 className="home-title">Welcome to NFT hub</h1>
        
        {/* Wallet Connection */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <ConnectButton />
          {isConnected && address && balance && (
            <div style={{ 
              marginTop: '1rem', 
              color: '#10B981', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              Wallet Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </div>
          )}
        </div>

        <ChromaGrid items={nftCards} className="nft-grid" />
        
        {/* Premium NFT Section - Silver+ Members Only */}
        <div style={{ marginTop: '4rem' }}>
          <MembershipGatedFeature 
            requiredTier="Silver" 
            featureName="Premium NFT Collection"
            showPreview={true}
          >
            <h1 className="home-title">Premium Collection</h1>
            <p style={{ 
              textAlign: 'center', 
              color: '#C0C0C0', 
              fontSize: '1.2rem',
              marginBottom: '2rem' 
            }}>
              Exclusive high-value NFTs for Silver+ members
            </p>
            <ChromaGrid items={premiumNftCards} className="nft-grid" />
          </MembershipGatedFeature>
        </div>
        
        {/* Governance Section - Gold Members Only */}
        <div style={{ marginTop: '4rem' }}>
          <MembershipGatedFeature 
            requiredTier="Gold" 
            featureName="DAO Governance"
            showPreview={true}
          >
            <h1 className="home-title">DAO Governance</h1>
            <div style={{
              background: 'linear-gradient(135deg, #FFD70020, #FFD70010)',
              border: '2px solid #FFD700',
              borderRadius: '16px',
              padding: '2rem',
              margin: '2rem 0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏛️</div>
              <h3 style={{ color: '#FFD700', marginBottom: '1rem' }}>Treasury Governance</h3>
              <p style={{ color: '#ccc', marginBottom: '2rem' }}>
                As a Gold member, you can vote on treasury decisions, propose new features, 
                and help shape the future of NFT Treasury.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <div style={{ 
                  background: '#1f1f1f', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}>
                  <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Active Proposals</h4>
                  <p style={{ color: '#10B981', fontSize: '2rem', margin: '0' }}>3</p>
                </div>
                
                <div style={{ 
                  background: '#1f1f1f', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}>
                  <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Your Voting Power</h4>
                  <p style={{ color: '#4F46E5', fontSize: '2rem', margin: '0' }}>{nftCount}</p>
                </div>
                
                <div style={{ 
                  background: '#1f1f1f', 
                  padding: '1.5rem', 
                  borderRadius: '8px',
                  border: '1px solid #333'
                }}>
                  <h4 style={{ color: '#FFD700', marginBottom: '0.5rem' }}>Treasury Balance</h4>
                  <p style={{ color: '#10B981', fontSize: '2rem', margin: '0' }}>127 ETH</p>
                </div>
              </div>
              
              <button style={{
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #FFD700, #FFC107)',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}>
                Enter DAO Dashboard
              </button>
            </div>
          </MembershipGatedFeature>
        </div>
        
        {/* Transaction Status */}
        {isSuccess && txData && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: '#10B981', 
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'white' }}>
              NFT Purchase Successful!
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txData}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'underline' }}
            >
              View Transaction on Etherscan
            </a>
          </div>
        )}
        
        {error && (
          <div style={{ 
            marginTop: '2rem',
            color: '#ef4444', 
            padding: '1rem',
            background: '#2a1f1f',
            borderRadius: '8px',
            border: '1px solid #ef4444',
            textAlign: 'center',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Transaction failed: {(error as Error).message}
          </div>
        )}
        
        {isBuying && selectedNFT && (
          <div style={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            zIndex: 1000,
            border: '2px solid #4F46E5'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Processing purchase for {selectedNFT}...
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #333',
              borderTop: '4px solid #4F46E5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
