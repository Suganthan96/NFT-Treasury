'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, NftIcon, MintIcon, LeaderboardIcon, SettingsIcon } from '../icons/pixel-icons';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/my-nfts', label: 'My NFTs', icon: NftIcon },
  { href: '/mint', label: 'Mint', icon: MintIcon },
  { href: '/leaderboard', label: 'Leaderboard', icon: LeaderboardIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col items-center space-y-4 w-24 bg-black/30 border-r-4 border-primary/50 py-8">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              "flex flex-col items-center p-3 transition-all duration-200 hover:text-accent text-primary/70 hover:text-glow-accent",
              isActive && "text-accent text-glow-accent scale-110"
            )}
          >
            <Icon className="w-10 h-10" />
            <span className="mt-1 text-xs font-body uppercase">{label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
