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
  const [goldAnalytics, setGoldAnalytics] = useState<any>(null);
  const [
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    , setGoldAirdropHistory] = useState<any[]>([]);
  const [goldVipEvents, setGoldVipEvents] = useState<any[]>([]);

  const { writeContract, isSuccess, data: txData, error } = useWriteContract();

  // Check membership status
  useEffect(() => {
    async function checkMembership() {
      if (address && isConnected) {
        try {
          const status = await getUserMembershipStatus(address, nftCount);
          setMembershipStatus(status.ownedBadges);
          
          // Load Gold analytics if user is Gold member
          if (status.ownedBadges['Gold']) {
            await loadGoldAnalytics();
            await loadGoldVipEvents();
          }
        } catch (error) {
          console.error('Error checking membership:', error);
        }
      }
      setMembershipLoading(false);
    }
    
    checkMembership();
  }, [address, isConnected, nftCount]);

  // Load Gold member analytics
  const loadGoldAnalytics = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/gold-analytics/${address}`);
      if (response.ok) {
        const analytics = await response.json();
        setGoldAnalytics(analytics);
      }
    } catch (error) {
      console.error('Error loading Gold analytics:', error);
    }
  };

  // Load Gold VIP Events
  const loadGoldVipEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/gold-vip-events');
      if (response.ok) {
        const events = await response.json();
        setGoldVipEvents(events);
      }
    } catch (error) {
      console.error('Error loading Gold VIP events:', error);
    }
  };

  // Handle successful NFT minting
  useEffect(() => {
    if (isSuccess && txData && selectedNFT) {
      console.log(`🎉 NFT Minted Successfully! Transaction: ${txData}`);
      setPurchasedNFTs(prev => new Set(prev).add(selectedNFT));
      alert(`🎉 Successfully minted ${selectedNFT}! View transaction: https://sepolia.etherscan.io/tx/${txData}`);
      setSelectedNFT('');
    }
  }, [isSuccess, txData, selectedNFT]);

  // Gold exclusive NFTs - only visible to Gold members
  const goldExclusiveNFTs: ChromaItem[] = [
    {
      title: "Gray Skull Ape",
      subtitle: "Gold VIP Exclusive",
      image: "/gold-ape-1.png",
      borderColor: "#FFD700",
      gradient: "linear-gradient(145deg,#FFD700,#FFA500)",
      price: "0.15", // Premium pricing for exclusive apes
      onBuy: () => handleBuyNFT("Gray Skull Ape", "/gold-ape-1.png", "0.15"),
      isLoading: isBuying && selectedNFT === "Gray Skull Ape",
      isPurchased: purchasedNFTs.has("Gray Skull Ape"),
    },
    {
      title: "Pixel Vision Ape",
      subtitle: "Gold VIP Exclusive",
      image: "/gold-pixel-ape.png",
      borderColor: "#00FF88",
      gradient: "linear-gradient(145deg,#00FF88,#00CC6A)",
      price: "0.18",
      onBuy: () => handleBuyNFT("Pixel Vision Ape", "/gold-pixel-ape.png", "0.18"),
      isLoading: isBuying && selectedNFT === "Pixel Vision Ape",
      isPurchased: purchasedNFTs.has("Pixel Vision Ape"),
    },
    {
      title: "Fire Neon Ape",
      subtitle: "Gold VIP Exclusive",
      image: "/gold-fire-ape.png",
      borderColor: "#FF4500",
      gradient: "linear-gradient(145deg,#FF4500,#FF6B35)",
      price: "0.25",
      onBuy: () => handleBuyNFT("Fire Neon Ape", "/gold-fire-ape.png", "0.25"),
      isLoading: isBuying && selectedNFT === "Fire Neon Ape",
      isPurchased: purchasedNFTs.has("Fire Neon Ape"),
    },
    {
      title: "Voxel Tech Ape",
      subtitle: "Gold VIP Exclusive",
      image: "/gold-voxel-ape.png",
      borderColor: "#FF1493",
      gradient: "linear-gradient(145deg,#FF1493,#DC143C)",
      price: "0.30",
      onBuy: () => handleBuyNFT("Voxel Tech Ape", "/gold-voxel-ape.png", "0.30"),
      isLoading: isBuying && selectedNFT === "Voxel Tech Ape",
      isPurchased: purchasedNFTs.has("Voxel Tech Ape"),
    },
  ];

  const handleBuyNFT = async (nftTitle: string, nftImage: string, price: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    
    // Apply Gold member discount
    const isGoldMember = membershipStatus['Gold'];
    const discountedPrice = isGoldMember ? (parseFloat(price) * 0.7).toFixed(2) : price; // 30% discount
    
    if (isGoldMember) {
      console.log(`🥇 Gold Member Discount Applied: ${price} ETH → ${discountedPrice} ETH`);
    }
    
    setIsBuying(true);
    setSelectedNFT(nftTitle);
    
    try {
      console.log(`🛒 Starting NFT purchase: ${nftTitle} (${isGoldMember ? 'Gold Price: ' + discountedPrice : 'Regular Price: ' + price} ETH)`);
      
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
      
      // Step 2: Create metadata for the NFT with Gold member benefits
      const metadata = {
        name: nftTitle,
        description: `Premium ${nftTitle} NFT from the NFL collection - ${isGoldMember ? `Gold Member Price: ${discountedPrice} ETH (30% discount)` : `Price: ${price} ETH`}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Collection", value: "NFL Premium" },
          { trait_type: "Original Price", value: `${price} ETH` },
          { trait_type: "Purchase Price", value: `${discountedPrice} ETH` },
          { trait_type: "Member Tier", value: isGoldMember ? "Gold VIP" : "Standard" },
          { trait_type: "Discount Applied", value: isGoldMember ? "30%" : "None" },
          { trait_type: "Rarity", value: isGoldMember ? "Gold Exclusive" : "Standard" },
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
        {/* Hero Section */}
        <div className="home-hero">
          <div className="hero-content">
            <BlurText text="NFT Treasury" className="hero-main-title" animateBy="words" direction="top" />
            <p className="hero-subtitle">Discover, Collect, and Trade Premium NFTs across Exclusive Membership Tiers</p>
            
            {/* Stats Cards */}
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">{nftCards.length + premiumNftCards.length + goldExclusiveNFTs.length}</div>
                <div className="stat-label">Total NFTs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{nftCount || 0}</div>
                <div className="stat-label">Your Collection</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">3</div>
                <div className="stat-label">Membership Tiers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Object.values(membershipStatus).filter(Boolean).length}</div>
                <div className="stat-label">Active Memberships</div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="wallet-connection">
              <ConnectButton />
              {isConnected && address && balance && (
                <div className="wallet-info">
                  <div className="balance-display">
                    <span className="balance-label">Wallet Balance:</span>
                    <span className="balance-amount">{parseFloat(balance.formatted).toFixed(4)} {balance.symbol}</span>
                  </div>
                  <div className="address-display">
                    <span className="address-label">Address:</span>
                    <span className="address-value">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Membership Status Cards */}
        {isConnected && (
          <div className="membership-overview">
            <h3 className="section-title">Your Membership Status</h3>
            <div className="membership-cards">
              <div className={`membership-card bronze ${membershipStatus['Bronze'] ? 'active' : 'inactive'}`}>
                <div className="membership-icon">🥉</div>
                <div className="membership-name">Bronze Tier</div>
                <div className="membership-status">{membershipStatus['Bronze'] ? 'Active' : 'Inactive'}</div>
                <div className="membership-benefits">
                  <div>• Access to standard NFTs</div>
                  <div>• Community access</div>
                </div>
              </div>
              <div className={`membership-card silver ${membershipStatus['Silver'] ? 'active' : 'inactive'}`}>
                <div className="membership-icon">🥈</div>
                <div className="membership-name">Silver Tier</div>
                <div className="membership-status">{membershipStatus['Silver'] ? 'Active' : 'Inactive'}</div>
                <div className="membership-benefits">
                  <div>• Premium NFT access</div>
                  <div>• Exclusive events</div>
                </div>
              </div>
              <div className={`membership-card gold ${membershipStatus['Gold'] ? 'active' : 'inactive'}`}>
                <div className="membership-icon">🥇</div>
                <div className="membership-name">Gold Tier</div>
                <div className="membership-status">{membershipStatus['Gold'] ? 'Active' : 'Inactive'}</div>
                <div className="membership-benefits">
                  <div>• 30% discount on all NFTs</div>
                  <div>• Exclusive gold collections</div>
                  <div>• Priority support</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NFT Collections */}
        <div className="nft-collections">
          {/* BRONZE TIER SECTION */}
          <div className="tier-section bronze-section">
            <div className="tier-header">
              <div className="tier-icon">🥉</div>
              <div className="tier-content">
                <h2 className="tier-title">Bronze Tier Collection</h2>
                <p className="tier-description">Start your NFT journey with our foundational collection</p>
                <div className="tier-stats">
                  <span className="tier-count">{nftCards.length} NFTs Available</span>
                  <span className="tier-access">Open to All</span>
                </div>
              </div>
            </div>
            <ChromaGrid items={nftCards} className="nft-grid" />
          </div>

          {/* SILVER TIER SECTION */}
          {(membershipStatus['Silver'] || membershipStatus['Gold']) ? (
            <div className="tier-section silver-section">
              <div className="tier-header">
                <div className="tier-icon">🥈</div>
                <div className="tier-content">
                  <h2 className="tier-title">Silver Tier Collection</h2>
                  <p className="tier-description">Premium NFTs for verified Silver members</p>
                  <div className="tier-stats">
                    <span className="tier-count">{premiumNftCards.length} NFTs Available</span>
                    <span className="tier-access">Silver+ Members Only</span>
                  </div>
                </div>
              </div>
              <ChromaGrid items={premiumNftCards} className="nft-grid" />
            </div>
          ) : (
            <div className="tier-section silver-section locked">
              <div className="tier-header">
                <div className="tier-icon">🔒</div>
                <div className="tier-content">
                  <h2 className="tier-title">Silver Tier Collection</h2>
                  <p className="tier-description">Unlock premium NFTs with Silver membership</p>
                  <div className="tier-stats">
                    <span className="tier-count">{premiumNftCards.length} NFTs Locked</span>
                    <span className="tier-access">Requires Silver Membership</span>
                  </div>
                </div>
              </div>
              <div className="locked-content">
                <div className="lock-icon">🔐</div>
                <h3>Silver Membership Required</h3>
                <p>Upgrade to Silver tier to access these exclusive premium NFTs</p>
                <button className="upgrade-btn">Upgrade to Silver</button>
              </div>
            </div>
          )}

          {/* GOLD TIER SECTION */}
          {membershipStatus['Gold'] ? (
            <div className="tier-section gold-section">
              <div className="tier-header">
                <div className="tier-icon">🥇</div>
                <div className="tier-content">
                  <h2 className="tier-title">Gold Tier Collection</h2>
                  <p className="tier-description">Ultra-exclusive NFTs with 30% discount for Gold VIPs</p>
                  <div className="tier-stats">
                    <span className="tier-count">{goldExclusiveNFTs.length} NFTs Available</span>
                    <span className="tier-access">Gold VIP Exclusive</span>
                  </div>
                </div>
              </div>
              <ChromaGrid items={goldExclusiveNFTs} className="nft-grid" />
            </div>
          ) : (
            <div className="tier-section gold-section locked">
              <div className="tier-header">
                <div className="tier-icon">🔒</div>
                <div className="tier-content">
                  <h2 className="tier-title">Gold Tier Collection</h2>
                  <p className="tier-description">The most exclusive NFTs with VIP benefits</p>
                  <div className="tier-stats">
                    <span className="tier-count">{goldExclusiveNFTs.length} NFTs Locked</span>
                    <span className="tier-access">Requires Gold VIP Membership</span>
                  </div>
                </div>
              </div>
              <div className="locked-content">
                <div className="lock-icon">👑</div>
                <h3>Gold VIP Membership Required</h3>
                <p>Unlock the most exclusive NFTs and get 30% discount on all purchases</p>
                <div className="gold-benefits">
                  <div>✨ 30% discount on all NFTs</div>
                  <div>🎯 Exclusive gold collections</div>
                  <div>🏆 Priority support & early access</div>
                </div>
                <button className="upgrade-btn gold">Upgrade to Gold VIP</button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isBuying && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>
              Processing purchase for {selectedNFT}...
            </div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #333',
              borderTop: '4px solid #4F46E5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
