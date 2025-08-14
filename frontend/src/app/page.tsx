import { NFTCard } from '@/components/game-ui/NFTCard';

const nfts = [
  { id: 1, name: "Cyber Glider", imageUrl: "https://placehold.co/300x300.png", rarity: "Epic", dataAiHint: "cyberpunk ship" },
  { id: 2, name: "Neon Samurai", imageUrl: "https://placehold.co/300x300.png", rarity: "Legendary", dataAiHint: "neon samurai" },
  { id: 3, name: "Pixel Bot", imageUrl: "https://placehold.co/300x300.png", rarity: "Common", dataAiHint: "pixel robot" },
  { id: 4, name: "Arcade Master", imageUrl: "https://placehold.co/300x300.png", rarity: "Rare", dataAiHint: "arcade machine" },
  { id: 5, name: "Synthwave Sunset", imageUrl: "https://placehold.co/300x300.png", rarity: "Rare", dataAiHint: "synthwave sunset" },
  { id: 6, name: "Glitch Orb", imageUrl: "https://placehold.co/300x300.png", rarity: "Epic", dataAiHint: "glitch art" },
  { id: 7, name: "Holo-Dragon", imageUrl: "https://placehold.co/300x300.png", rarity: "Legendary", dataAiHint: "holographic dragon" },
  { id: 8, name: "Data Stream", imageUrl: "https://placehold.co/300x300.png", rarity: "Common", dataAiHint: "data stream" },
];

export default function HomePage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-5xl text-glow-primary mb-8">NFT GALLERY</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {nfts.map((nft, index) => (
          <NFTCard 
            key={nft.id} 
            name={nft.name} 
            imageUrl={nft.imageUrl} 
            rarity={nft.rarity} 
            animationDelay={`${index * 100}ms`}
            dataAiHint={nft.dataAiHint}
          />
        ))}
      </div>
    </div>
  );
}
