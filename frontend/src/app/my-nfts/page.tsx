import { NFTCard } from '@/components/game-ui/NFTCard';

const myNfts = [
  { id: 2, name: "Neon Samurai", imageUrl: "https://placehold.co/300x300.png", rarity: "Legendary", dataAiHint: "neon samurai" },
  { id: 6, name: "Glitch Orb", imageUrl: "https://placehold.co/300x300.png", rarity: "Epic", dataAiHint: "glitch art" },
  { id: 7, name: "Holo-Dragon", imageUrl: "https://placehold.co/300x300.png", rarity: "Legendary", dataAiHint: "holographic dragon" },
];

export default function MyNftsPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-5xl text-glow-primary mb-8">MY NFTs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {myNfts.map((nft, index) => (
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
