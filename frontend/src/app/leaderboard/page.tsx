const leaderboardData = [
  { rank: 1, name: 'CYBERPUNK_77', score: 999990, avatar: 'https://placehold.co/40x40.png' },
  { rank: 2, name: 'NEON_NINJA', score: 850000, avatar: 'https://placehold.co/40x40.png' },
  { rank: 3, name: 'PIXEL_PIONEER', score: 780000, avatar: 'https://placehold.co/40x40.png' },
  { rank: 4, name: 'ARCADE_ACE', score: 690000, avatar: 'https://placehold.co/40x40.png' },
  { rank: 5, name: 'SYNTHWAVE_SOUL', score: 610000, avatar: 'https://placehold.co/40x40.png' },
  { rank: 6, name: 'GLITCH_GHOST', score: 550000, avatar: 'https://placehold.co/40x40.png' },
];

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-5xl text-glow-primary mb-4 text-center">HIGH SCORES</h1>
      <div className="pixel-border bg-black/30 p-4 md:p-8">
        <div className="grid grid-cols-[1fr_4fr_2fr] gap-4 text-lg md:text-2xl font-headline mb-4 text-accent/80">
          <div className="text-glow-accent">RANK</div>
          <div className="text-glow-accent">PLAYER</div>
          <div className="text-glow-accent text-right">SCORE</div>
        </div>
        <div className="space-y-2">
          {leaderboardData.map((player) => (
            <div
              key={player.rank}
              className="grid grid-cols-[1fr_4fr_2fr] items-center gap-4 p-2 text-base md:text-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <div className="text-glow-primary">{player.rank}</div>
              <div className="truncate">{player.name}</div>
              <div className="text-right text-glow-primary">{player.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
