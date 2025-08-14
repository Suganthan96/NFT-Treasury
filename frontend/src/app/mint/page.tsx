import { MintInterface } from '@/components/game-ui/MintInterface';

export default function MintPage() {
  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-5xl text-glow-primary mb-8">MINT NEW NFT</h1>
      <MintInterface />
    </div>
  );
}
