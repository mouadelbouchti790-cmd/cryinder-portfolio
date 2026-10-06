import { useEffect, useRef } from 'react';
import BrandMark from '../BrandMark';
import TokenSearchBar from '../TokenSearchBar';
import type { TokenSearchResult } from '../TokenSearchBar';

interface DashboardHeaderProps {
  walletAddress?: string | null;
  cpBalance: number;
  onSearchSelect: (token: TokenSearchResult) => void;
  onConnect: () => void;
  onDisconnect?: () => void;
  networkName?: string;
}

function truncate(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function DashboardHeader({
  walletAddress,
  cpBalance,
  onSearchSelect,
  onConnect,
  onDisconnect,
  networkName = 'Solana',
}: DashboardHeaderProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  // Global `/` focuses search — utility-first, keyboard-driven.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const connected = !!walletAddress;

  return (
    <div className="glass-header sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-3 px-4 sm:px-6">
        {/* Left: C-mark */}
        <div className="flex shrink-0 items-center gap-2.5">
          <BrandMark className="h-7 w-7 rounded-[3px] object-contain" />
          <span className="hidden font-display text-[15px] font-bold tracking-tight text-white sm:block">
            Cryinder
          </span>
        </div>

        {/* Center: global search with glow + / hint */}
        <div ref={searchRef} className="min-w-0 flex-1 sm:max-w-[400px]">
          <TokenSearchBar
            onTokenSelect={onSearchSelect}
            placeholder="Search tokens…"
            className="[&>div]:search-glow [&>div]:rounded-[3px] [&>div]:border-[rgba(255,255,255,0.08)] [&>div]:bg-[#111827] [&>div]:py-2.5"
          />
        </div>
        <kbd
          aria-hidden="true"
          className="hidden h-5 w-5 shrink-0 items-center justify-center rounded-[3px] border border-white/[0.08] bg-[rgba(255,255,255,0.05)] text-[11px] font-bold text-white/40 md:flex"
        >
          /
        </kbd>

        {/* Right: network + metrics + wallet */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div
            className="hidden items-center gap-1.5 rounded-[3px] border border-white/[0.08] bg-[#111827] px-3 py-1.5 lg:flex"
            title="Network status"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-[#10B981] opacity-60" />
              <span className="h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-black" />
            </span>
            <span className="text-xs font-semibold text-[#E5E7EB]">{networkName}</span>
          </div>

          <div
            className="hidden items-center gap-1.5 rounded-[3px] border border-white/[0.08] bg-[#111827] px-3 py-1.5 sm:flex"
            title="CP balance"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">CP</span>
            <span className="tnum text-[13px] font-extrabold text-[#E2E8F0]">
              {cpBalance.toLocaleString()}
            </span>
          </div>

          {connected ? (
            <div className="flex items-center gap-2 rounded-[3px] border border-white/[0.08] bg-[#111827] py-1.5 pl-1.5 pr-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[rgba(255,255,255,0.06)] font-mono text-[10px] font-bold text-[#E5E7EB]">
                {walletAddress!.slice(0, 2).toUpperCase()}
              </span>
              <span className="tnum font-mono text-xs font-semibold text-white/80">
                {truncate(walletAddress!)}
              </span>
              <span className="h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-black" aria-label="Connected" />
              {onDisconnect && (
                <button
                  onClick={onDisconnect}
                  className="ml-1 rounded-[3px] px-1.5 py-1 text-[11px] font-bold text-white/40 transition-colors hover:text-white/80"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="min-h-[40px] rounded-[3px] bg-[#3B82F6] px-5 text-[13px] font-extrabold text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors hover:bg-[#2563EB]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
