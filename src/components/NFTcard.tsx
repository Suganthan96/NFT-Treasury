// src/components/NFTCard.tsx
import React from 'react';
import './NFTCard.css';

interface NFTCardProps {
  imageUrl: string;
  title: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ imageUrl, title }) => {
  return (
    <div className="nft-card">
      <div className="badge">Membership</div>
      <img src={imageUrl} alt={title} className="nft-image" />
      <div className="nft-title">{title}</div>
      <button className="buy-button">Buy Membership</button>
    </div>
  );
};

export default NFTCard;

