'use client';
import { Button } from "@/components/ui/button";

interface MissionCompleteBannerProps {
  onReset: () => void;
}

export function MissionCompleteBanner({ onReset }: MissionCompleteBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 pixel-border bg-black/50 animate-drop-in">
      <h2 className="text-4xl md:text-6xl font-headline text-glow-accent animate-press-start-blink">
        MISSION COMPLETE!
      </h2>
      <p className="mt-4 text-xl text-foreground">
        Your NFT has been successfully minted to the treasury.
      </p>
      <p className="mt-2 text-lg text-glow-primary">
        +500 XP GAINED
      </p>
      <Button 
        onClick={onReset} 
        size="lg" 
        className="mt-8 font-headline text-xl bg-accent text-accent-foreground hover:bg-accent/80 pixel-border-accent"
      >
        Mint Another
      </Button>
    </div>
  );
}
