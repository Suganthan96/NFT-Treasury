import ChromaGrid, { ChromaItem } from "../components/NFTcard";
import BlurText from "../components/BlurText";
import MembershipGatedFeature from "../components/MembershipGatedFeature";
import GoldVIPDashboard from "../components/GoldVIPDashboard";
import { getUserMembershipStatus } from "../utils/bitbadges";
import "../index.css";
import { Alchemy, Network } from "alchemy-sdk";
import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
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
  const [purchasedNFTs, setPurchasedNFTs] = useState<Set<string>>(new Set());
  const [membershipStatus, setMembershipStatus] = useState<{[key: string]: boolean}>({});
  const [membershipLoading, setMembershipLoading] = useState(true);

  const { writeContract, isSuccess, data: txData, error } = useWriteContract();

  // Check membership status
  useEffect(() => {
    async function checkMembership() {
      if (address && isConnected) {
        try {
          const status = await getUserMembershipStatus(address, nftCount);
          setMembershipStatus(status.ownedBadges);
        } catch (error) {
          console.error('Error checking membership:', error);
        }
      }
      setMembershipLoading(false);
    }
    
    checkMembership();
  }, [address, isConnected, nftCount]);

  // Handle successful NFT minting
  useEffect(() => {
    if (isSuccess && txData && selectedNFT) {
      console.log(`🎉 NFT Minted Successfully! Transaction: ${txData}`);
      setPurchasedNFTs(prev => new Set(prev).add(selectedNFT));
      alert(`🎉 Successfully minted ${selectedNFT}! View transaction: https://sepolia.etherscan.io/tx/${txData}`);
      setSelectedNFT('');
    }
  }, [isSuccess, txData, selectedNFT]);

  // Check if user has Silver or Gold access
  const hasPremiumAccess = membershipStatus['Silver'] || membershipStatus['Gold'];

  const handleBuyNFT = async (nftTitle: string, nftImage: string, price: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    
    setIsBuying(true);
    setSelectedNFT(nftTitle);
    
    try {
      console.log(`🛒 Starting NFT purchase: ${nftTitle}`);
      
      // Step 1: First upload the image to IPFS if it's a local file
      let imageUrl = nftImage;
      
      if (nftImage.startsWith('/') || nftImage.startsWith('./')) {
        console.log(`📤 Uploading image to IPFS: ${nftImage}`);
        
        // Fetch the image file from public folder
        const imageResponse = await fetch(nftImage);
        const imageBlob = await imageResponse.blob();
        
        // Create form data for image upload
        const imageFormData = new FormData();
        imageFormData.append('file', imageBlob, `${nftTitle.replace(/\s+/g, '_')}.png`);
        
        // Upload image to Pinata
        const imageRes = await fetch('http://localhost:3001/api/pinata-upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!imageRes.ok) throw new Error('Failed to upload image to Pinata');
        
        const imageData = await imageRes.json();
        const imageCID = imageData.IpfsHash;
        imageUrl = `https://gateway.pinata.cloud/ipfs/${imageCID}`;
        
        console.log(`✅ Image uploaded to IPFS: ${imageUrl}`);
      }
      
      // Step 2: Create metadata for the NFT
      const metadata = {
        name: nftTitle,
        description: `Premium ${nftTitle} NFT from the NFL collection - Price: ${price} ETH`,
        image: imageUrl,
        attributes: [
          { trait_type: "Collection", value: "NFL Premium" },
          { trait_type: "Price", value: `${price} ETH` },
          { trait_type: "Rarity", value: "Legendary" },
          { trait_type: "Purchased Date", value: new Date().toISOString().split('T')[0] }
        ],
      };
      
      console.log(`📝 Uploading metadata to IPFS...`);
      
      // Step 3: Upload metadata to Pinata
      const metaRes = await fetch('http://localhost:3001/api/pinata-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      
      if (!metaRes.ok) throw new Error('Failed to upload metadata to Pinata');
      
      const metaData = await metaRes.json();
      const metaCID = metaData.IpfsHash;
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaCID}`;
      
      console.log(`✅ Metadata uploaded to IPFS: ${tokenURI}`);
      console.log(`⚡ Minting NFT on blockchain...`);

      // Step 4: Mint NFT on blockchain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'mint',
        args: [address as string, tokenURI],
        chainId: 11155111, // Sepolia
      });

      console.log(`🎉 NFT purchase initiated for ${nftTitle}!`);

    } catch (err) {
      const error = err as Error & { reason?: string };
      console.error('❌ Purchase failed:', error);
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
      isLoading: isBuying && selectedNFT === "Quarterback Edition",
      isPurchased: purchasedNFTs.has("Quarterback Edition"),
    },
    {
      title: "Hail Mary Pass",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg,#10B981,#000)",
      price: "0.3",
      onBuy: () => handleBuyNFT("Hail Mary Pass", "/nft2.png", "0.3"),
      isLoading: isBuying && selectedNFT === "Hail Mary Pass",
      isPurchased: purchasedNFTs.has("Hail Mary Pass"),
    },
    {
      title: "End Zone Elite",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg,#F59E0B,#000)",
      price: "0.7",
      onBuy: () => handleBuyNFT("End Zone Elite", "/nft3.png", "0.7"),
      isLoading: isBuying && selectedNFT === "End Zone Elite",
      isPurchased: purchasedNFTs.has("End Zone Elite"),
    },
    {
      title: "The Line of Scrimmage",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg,#EF4444,#000)",
      price: "0.4",
      onBuy: () => handleBuyNFT("The Line of Scrimmage", "/nft4.png", "0.4"),
      isLoading: isBuying && selectedNFT === "The Line of Scrimmage",
      isPurchased: purchasedNFTs.has("The Line of Scrimmage"),
    },
    {
      title: "The Lombardi Trophy",
      subtitle: "NFL NFT",
      image: "/nft5.png",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg,#8B5CF6,#000)",
      price: "1.2",
      onBuy: () => handleBuyNFT("The Lombardi Trophy", "/nft5.png", "1.2"),
      isLoading: isBuying && selectedNFT === "The Lombardi Trophy",
      isPurchased: purchasedNFTs.has("The Lombardi Trophy"),
    },
    {
      title: "Gridiron Glory",
      subtitle: "NFL NFT",
      image: "/nft1.png",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg,#06B6D4,#000)",
      price: "0.6",
      onBuy: () => handleBuyNFT("Gridiron Glory", "/nft1.png", "0.6"),
      isLoading: isBuying && selectedNFT === "Gridiron Glory",
      isPurchased: purchasedNFTs.has("Gridiron Glory"),
    },
    {
      title: "Touchdown Titan",
      subtitle: "NFL NFT",
      image: "/nft2.png",
      borderColor: "#F472B6",
      gradient: "linear-gradient(120deg,#F472B6,#000)",
      price: "0.8",
      onBuy: () => handleBuyNFT("Touchdown Titan", "/nft2.png", "0.8"),
      isLoading: isBuying && selectedNFT === "Touchdown Titan",
      isPurchased: purchasedNFTs.has("Touchdown Titan"),
    },
    {
      title: "Blitz Brigade",
      subtitle: "NFL NFT",
      image: "/nft3.png",
      borderColor: "#34D399",
      gradient: "linear-gradient(160deg,#34D399,#000)",
      price: "0.35",
      onBuy: () => handleBuyNFT("Blitz Brigade", "/nft3.png", "0.35"),
      isLoading: isBuying && selectedNFT === "Blitz Brigade",
      isPurchased: purchasedNFTs.has("Blitz Brigade"),
    },
    {
      title: "Pigskin Prodigy",
      subtitle: "NFL NFT",
      image: "/nft4.png",
      borderColor: "#FBBF24",
      gradient: "linear-gradient(200deg,#FBBF24,#000)",
      price: "0.45",
      onBuy: () => handleBuyNFT("Pigskin Prodigy", "/nft4.png", "0.45"),
      isLoading: isBuying && selectedNFT === "Pigskin Prodigy",
      isPurchased: purchasedNFTs.has("Pigskin Prodigy"),
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
    },
    {
      title: "MVP Trophy",
      subtitle: "Platinum NFL NFT",
      image: "/nft2.png",
      borderColor: "#DB2777",
      gradient: "linear-gradient(145deg,#DB2777,#000)",
      price: "4.2",
      onBuy: () => handleBuyNFT("MVP Trophy", "/nft2.png", "4.2"),
    },
    {
      title: "Dynasty Master",
      subtitle: "Legendary NFL NFT",
      image: "/nft4.png",
      borderColor: "#7C3AED",
      gradient: "linear-gradient(145deg,#7C3AED,#000)",
      price: "6.8",
      onBuy: () => handleBuyNFT("Dynasty Master", "/nft4.png", "6.8"),
    },
    {
      title: "Ultimate Victory",
      subtitle: "Mythical NFL NFT",
      image: "/nft1.png",
      borderColor: "#FF6B00",
      gradient: "linear-gradient(145deg,#FF6B00,#000)",
      price: "8.5",
      onBuy: () => handleBuyNFT("Ultimate Victory", "/nft1.png", "8.5"),
    }
  ];

  return (
    <div className="page modern-bg">
      <Navbar />
      <div className="content-wrapper">
        <BlurText text="Welcome to NFT hub" className="home-title" animateBy="words" direction="top" />
        
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
          {/* Show premium NFTs only to Silver/Gold members */}
          {isConnected && hasPremiumAccess ? (
            <div>
              <BlurText 
                text="🌟 Premium Collection" 
                className="home-title" 
                animateBy="words" 
                direction="top" 
              />
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '2rem',
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(255, 215, 0, 0.1))',
                borderRadius: '12px',
                border: '1px solid rgba(192, 192, 192, 0.3)'
              }}>
                <p style={{ 
                  color: '#C0C0C0', 
                  fontSize: '1.2rem',
                  marginBottom: '0.5rem' 
                }}>
                  ✨ Exclusive Premium NFTs - Silver & Gold Members Only
                </p>
                <p style={{ 
                  color: '#FFD700', 
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}>
                  🎯 Higher rarity • 💎 Limited editions • 🚀 Priority access
                </p>
              </div>
              <ChromaGrid items={premiumNftCards} className="nft-grid" />
            </div>
          ) : (
            /* Show locked premium section to Bronze/non-members */
            <div style={{ 
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, rgba(100,100,100,0.1), rgba(50,50,50,0.1))',
              borderRadius: '20px',
              border: '2px dashed rgba(100,100,100,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Blurred background preview */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                filter: 'blur(8px)',
                opacity: 0.3,
                zIndex: 0
              }}>
                <ChromaGrid items={premiumNftCards.slice(0, 3)} className="nft-grid" />
              </div>
              
              {/* Lock overlay */}
              <div style={{ 
                position: 'relative', 
                zIndex: 1,
                background: 'rgba(0,0,0,0.8)',
                borderRadius: '16px',
                padding: '2rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                <h3 style={{ 
                  color: 'white', 
                  fontSize: '2rem',
                  marginBottom: '1rem' 
                }}>
                  Premium Collection Locked
                </h3>
                <p style={{ 
                  color: '#ccc', 
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  maxWidth: '500px',
                  margin: '0 auto 1.5rem'
                }}>
                  Exclusive high-value NFTs with rare traits and limited editions. 
                  Only available to Silver and Gold members.
                </p>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem',
                  maxWidth: '600px',
                  margin: '0 auto 2rem'
                }}>
                  <div style={{
                    background: 'rgba(192, 192, 192, 0.1)',
                    border: '1px solid rgba(192, 192, 192, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥈</div>
                    <div style={{ color: '#C0C0C0', fontWeight: 'bold' }}>Silver Tier</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Own 3+ NFTs</div>
                  </div>
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🥇</div>
                    <div style={{ color: '#FFD700', fontWeight: 'bold' }}>Gold Tier</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Own 5+ NFTs</div>
                  </div>
                </div>

                <div style={{ 
                  color: '#888', 
                  fontSize: '1rem',
                  marginBottom: '1.5rem' 
                }}>
                  You currently own <strong style={{ color: '#10B981' }}>{nftCount}</strong> NFTs
                  {nftCount < 3 && (
                    <div style={{ marginTop: '0.5rem', color: '#FFA500' }}>
                      You need {3 - nftCount} more NFT{3 - nftCount > 1 ? 's' : ''} for Silver access
                    </div>
                  )}
                </div>

                <button
                  onClick={() => window.location.href = '/membership'}
                  style={{
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #C0C0C0, #FFD700)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🚀 Upgrade to Premium Membership
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Gold VIP Dashboard - Webhook-Powered Benefits */}
        <div style={{ marginTop: '4rem' }}>
          <MembershipGatedFeature 
            requiredTier="Gold" 
            featureName="Gold VIP Dashboard"
            showPreview={true}
          >
            <GoldVIPDashboard />
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
