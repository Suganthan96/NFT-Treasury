// src/pages/HomePage.tsx
import React from 'react';
import NFTCard from '../components/NFTcard';
import './HomePage.css';

const sampleNFTs = [
  {
    title: 'Elite Membership',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=NFT+1',
  },
  {
    title: 'Pro Access Pass',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=NFT+2',
  },
  {
    title: 'VIP Collector',
    imageUrl: 'https://via.placeholder.com/400x250.png?text=NFT+3',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <div className="nft-grid">
        {sampleNFTs.map((nft, index) => (
          <NFTCard key={index} title={nft.title} imageUrl={nft.imageUrl} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
