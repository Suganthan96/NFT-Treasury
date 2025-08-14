'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  name: string;
  imageUrl: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  animationDelay?: string;
  dataAiHint?: string;
}

const rarityStyles = {
  Common: 'border-primary/50',
  Rare: 'border-blue-400',
  Epic: 'border-purple-500',
  Legendary: 'border-amber-400',
};

const rarityGlow = {
  Common: 'hover:box-glow-primary',
  Rare: 'hover:shadow-[0_0_15px_3px_#60a5fa]',
  Epic: 'hover:shadow-[0_0_15px_3px_#a855f7]',
  Legendary: 'hover:shadow-[0_0_15px_3px_#fbbf24]',
}

export function NFTCard({ name, imageUrl, rarity, animationDelay, dataAiHint }: NFTCardProps) {
  return (
    <div
      className={cn(
        "group bg-black/30 p-3 pixel-border opacity-0 animate-drop-in",
        rarityStyles[rarity],
        rarityGlow[rarity]
      )}
      style={{ animationDelay }}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-background">
        <Image
          src={imageUrl}
          alt={`Image of ${name}`}
          fill
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          data-ai-hint={dataAiHint}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>
      <div className="mt-3 text-center">
        <h3 className="font-headline text-lg truncate group-hover:text-glow-primary transition-all">{name}</h3>
        <p className="font-body text-sm uppercase text-accent">{rarity}</p>
      </div>
    </div>
  );
}
