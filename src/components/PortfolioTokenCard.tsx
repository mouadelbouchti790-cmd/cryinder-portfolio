import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDownRight,
  Send,
  TrendingDown,
} from 'lucide-react';
import type { PortfolioHolding } from '../types/token';
import { formatPrice, formatChange, formatBalance } from '../utils/formatters';
import TokenLogo from './ui/TokenLogo';

interface PortfolioTokenCardProps {
  holding: PortfolioHolding;
  index: number;
  onOpen: (holding: PortfolioHolding) => void;
  onSell: (holding: PortfolioHolding) => void;
  onSend: (holding: PortfolioHolding) => void;
}

export default function PortfolioTokenCard({
  holding,
  index,
  onOpen,
  onSell,
  onSend,
}: PortfolioTokenCardProps) {
  const isPositive = holding.priceChange24h >= 0;
  const isFlat = holding.priceChange24h === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), type: 'spring', stiffness: 320, damping: 28 }}
      className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:border-white/[0.12]"
    >
      {/* Clickable main row */}
      <button
        type="button"
        onClick={() => onOpen(holding)}
        className="flex w-full items-center gap-3 text-left"
        aria-label={`Open ${holding.name} details`}
      >
        <TokenLogo src={holding.logoUrl} alt={holding.symbol} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-extrabold tracking-[-0.01em]">
              {holding.name}
            </span>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              {holding.symbol}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] font-semibold text-white/35">
            <span className="tabular-nums">{formatBalance(holding.balance)}</span>
            <span className="text-white/20">·</span>
            <span className="tabular-nums">{formatPrice(holding.priceUsd)}</span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[15px] font-extrabold tabular-nums tracking-[-0.01em]">
            {formatPrice(holding.valueUsd)}
          </div>
          <div
            className={`mt-0.5 flex items-center justify-end gap-1 text-[12px] font-bold tabular-nums ${
              isFlat
                ? 'text-white/25'
                : isPositive
                  ? 'text-emerald-400'
                  : 'text-[#E0827A]'
            }`}
          >
            {!isFlat &&
              (isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
              ))}
            {isFlat ? '-' : formatChange(holding.priceChange24h)}
          </div>
        </div>
      </button>

      {/* Quick actions — only Sell and Send */}
      <div className="mt-3 flex items-center gap-2 border-t border-white/[0.04] pt-3">
        <button
          type="button"
          onClick={() => onSell(holding)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-[11px] font-extrabold text-black transition-colors hover:bg-white/90"
        >
          <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
          Sell
        </button>
        <button
          type="button"
          onClick={() => onSend(holding)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] py-2.5 text-[11px] font-bold text-white/60 transition-colors hover:border-white/[0.15] hover:text-white/80"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Send
        </button>
      </div>
    </motion.div>
  );
}
