import { motion } from 'framer-motion';
import BrandMark from '../BrandMark';

interface PortfolioEmptyStateProps {
  mode: 'disconnected' | 'no-tokens' | 'no-results';
  query?: string;
  onConnect?: () => void;
  onRefresh?: () => void;
  onClear?: () => void;
}

export default function PortfolioEmptyState({ mode, query, onConnect, onRefresh, onClear }: PortfolioEmptyStateProps) {
  if (mode === 'no-results') {
    return (
      <div className="rounded-[4px] border border-white/[0.08] bg-[#111827] py-12 text-center">
        <p className="tnum text-sm font-semibold text-white/50">No tokens match “{query}”</p>
        <button onClick={onClear} className="mt-3 text-xs font-bold text-white/60 underline-offset-2 hover:text-white hover:underline">
          Clear search
        </button>
      </div>
    );
  }

  if (mode === 'no-tokens') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[4px] border border-white/[0.08] bg-[#111827] px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[3px] border border-white/[0.08] bg-[rgba(255,255,255,0.05)]">
          <BrandMark className="h-7 w-7 object-contain opacity-60" />
        </div>
        <h3 className="text-base font-bold text-white">No tokens yet</h3>
        <p className="mx-auto mb-6 mt-1 max-w-[280px] text-[13px] leading-relaxed text-[#9CA3AF]">
          Your wallet holds no SPL tokens. Swap some SOL on a DEX to get started.
        </p>
        <button onClick={onRefresh} className="min-h-[44px] rounded-[3px] bg-[#3B82F6] px-8 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors hover:bg-[#2563EB]">
          Refresh
        </button>
      </motion.div>
    );
  }

  // disconnected — refined centered container with metallic watermark
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[4px] border border-white/[0.08] bg-[#111827] px-6 py-16 text-center"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <img src="/logo.png" alt="" className="h-48 w-48 object-contain" draggable={false} />
      </div>
      <div className="relative z-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[3px] border border-white/[0.08] bg-[rgba(255,255,255,0.05)]">
          <BrandMark className="h-7 w-7 object-contain" />
        </div>
        <h3 className="font-display text-lg font-bold text-white">Connect to view your portfolio</h3>
        <p className="mx-auto mb-7 mt-2 max-w-[300px] text-[13px] leading-relaxed text-[#9CA3AF]">
          Balances, P&amp;L, perps and activity appear here once your wallet is linked.
        </p>
        <button onClick={onConnect} className="min-h-[44px] rounded-[3px] bg-[#3B82F6] px-8 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors hover:bg-[#2563EB]">
          Connect Wallet
        </button>
        <p className="mt-4 text-[11px] text-white/30">Supports Solana wallets · Read-only by default</p>
      </div>
    </motion.div>
  );
}
