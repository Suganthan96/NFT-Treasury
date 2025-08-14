import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between p-4 border-b-4 border-primary/50 bg-black/30">
      <div className="flex items-center">
        <h1 className="text-2xl md:text-3xl font-headline text-glow-primary select-none">
          NFT Arcade Treasury
        </h1>
      </div>
      <Button className="font-headline text-lg bg-accent text-accent-foreground hover:bg-accent/80 pixel-border-accent animate-press-start-blink">
        <span className="hidden md:inline">Connect Wallet</span>
        <span className="md:hidden">Connect</span>
      </Button>
    </header>
  );
}
