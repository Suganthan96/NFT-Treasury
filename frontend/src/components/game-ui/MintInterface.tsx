'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StatSlider } from './StatSlider';
import { MissionCompleteBanner } from './MissionCompleteBanner';
import Image from 'next/image';

export function MintInterface() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [rarity, setRarity] = useState(50);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
  };
  
  const handleReset = () => {
    setShowSuccess(false);
    setImagePreview(null);
    setRarity(50);
  }

  if (showSuccess) {
    return <MissionCompleteBanner onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-sm aspect-square bg-black/30 p-8 border-4 border-muted-foreground/50">
          <div className="absolute top-2 left-2 w-4 h-4 bg-muted-foreground/50 rounded-full" />
          <div className="absolute top-2 right-2 w-4 h-4 bg-muted-foreground/50 rounded-full" />
          <div className="absolute bottom-2 left-2 w-4 h-4 bg-muted-foreground/50 rounded-full" />
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-muted-foreground/50 rounded-full" />
          
          <label htmlFor="nft-image-upload" className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-primary/50 cursor-pointer hover:border-accent transition-colors">
            {imagePreview ? (
              <Image src={imagePreview} alt="NFT Preview" layout="fill" objectFit="cover" />
            ) : (
              <div className="text-center">
                <p className="font-headline text-lg text-glow-primary">UPLOAD IMAGE</p>
                <p className="text-xs text-muted-foreground mt-2">Click to select file</p>
              </div>
            )}
          </label>
          <input id="nft-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>
        <p className="text-sm text-muted-foreground mt-2 font-body">PIXEL-TV-3000</p>
      </div>

      <div className="space-y-6 pixel-border p-6 bg-black/30">
        <div>
          <label htmlFor="name" className="block font-headline text-lg text-glow-accent mb-2">NAME</label>
          <Input id="name" placeholder="Enter NFT Name" className="bg-input border-2 border-primary/50 focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label htmlFor="description" className="block font-headline text-lg text-glow-accent mb-2">DESCRIPTION</label>
          <Textarea id="description" placeholder="Describe your NFT..." className="bg-input border-2 border-primary/50 focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label htmlFor="rarity" className="block font-headline text-lg text-glow-accent mb-2">RARITY</label>
          <StatSlider value={rarity} onValueChange={setRarity} />
        </div>

        <Button type="submit" size="lg" className="w-full font-headline text-2xl bg-primary text-primary-foreground hover:bg-primary/80 pixel-border-accent">
          MINT
        </Button>
      </div>
    </form>
  );
}
