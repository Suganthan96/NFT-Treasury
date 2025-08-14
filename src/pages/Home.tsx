import ChromaGrid, { ChromaItem } from "../components/NFTcard";
import BlurText from "../components/BlurText";
import AnimatedBackground from "../components/AnimatedBackground";
import "../index.css";
import { Alchemy, Network } from "alchemy-sdk";
import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import contractABI from '../abi/abi.json';

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
  const [isBuying, setIsBuying] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [purchasedNFTs, setPurchasedNFTs] = useState<Set<string>>(new Set());

  const { writeContract, isSuccess, data: txData } = useWriteContract();
  
  // Handle successful NFT minting
  useEffect(() => {
    if (isSuccess && txData && selectedNFT) {
      console.log(`🎉 NFT Minted Successfully! Transaction: ${txData}`);
      setPurchasedNFTs(prev => new Set(prev).add(selectedNFT));
      alert(`🎉 Successfully minted ${selectedNFT}! View transaction: https://sepolia.etherscan.io/tx/${txData}`);
      setSelectedNFT('');
    }
  }, [isSuccess, txData, selectedNFT]);

  const handleBuyNFT = async (nftTitle: string, nftImage: string, price: string) => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first.');
      return;
    }
    
    setIsBuying(true);
    setSelectedNFT(nftTitle);
    
    try {
      console.log(`🛒 Starting NFT purchase: ${nftTitle} (Price: ${price} ETH)`);
      
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
          { trait_type: "Rarity", value: "Standard" },
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

  return (
    <div className="page modern-bg relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="content-wrapper">
        {/* Hero Section */}
        <div className="home-hero">
          <div className="hero-content">
            <h1 className="hero-main-title">NFT Treasury</h1>
            <p className="hero-subtitle">Discover, Collect, and Trade Premium NFTs in the Digital Marketplace</p>
            
            {/* Stats Cards */}
            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-number">{nftCards.length}</div>
                <div className="stat-label">Total NFTs</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">5</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction Rate</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
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

        {/* NFT Collections */}
        <div className="nft-collections">
          <div className="collection-section">
            <div className="collection-header">
              <h2 className="collection-title">NFL NFT Collection</h2>
              <p className="collection-description">Discover our premium collection of NFL-themed NFTs</p>
              <div className="collection-stats">
                <span className="collection-count">{nftCards.length} NFTs Available</span>
                <span className="collection-access">Open to All</span>
              </div>
            </div>
            <ChromaGrid items={nftCards} className="nft-grid" />
          </div>
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
    </div>
  );
}
