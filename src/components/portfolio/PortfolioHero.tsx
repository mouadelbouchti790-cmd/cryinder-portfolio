import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, EyeOff, Send, QrCode, ArrowLeftRight } from 'lucide-react';
import type { PortfolioMetrics } from '../../types/token';
import { formatPrice, formatChange } from '../../utils/formatters';

interface PortfolioHeroProps {
  metrics: PortfolioMetrics;
  loading: boolean;
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
}

export default function PortfolioHero({ metrics, loading, onSend, onReceive, onSwap }: PortfolioHeroProps) {
  const [hidden, setHidden] = useState(false);
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#131C2E] p-6" aria-busy="true" aria-label="Loading portfolio summary">
        <div className="navy-skeleton h-3 w-32 rounded-full" />
        <div className="navy-skeleton mt-4 h-9 w-52 rounded-lg" />
        <div className="mt-4 flex gap-2">
          <div className="navy-skeleton h-12 flex-1 rounded-xl" />
          <div className="navy-skeleton h-12 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  const isPositive = metrics.change24hPct >= 0;
  const uplUsd = (metrics.totalValueUsd * metrics.change24hPct) / 100;
  const mask = (v: string) => (hidden ? '••••••' : v);

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#131C2E] p-6"
      aria-label="Portfolio summary"
    >
      {/* Old soft navy glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(226,232,240,0.06), transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(226,232,240,0.35), transparent)' }}
      />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
            Total Balance
          </p>
          <p className="tnum mt-1 text-[30px] font-bold leading-none tracking-tight text-white">
            {mask(formatPrice(metrics.totalValueUsd))}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold tnum ${
                isPositive
                  ? 'border-[#10B981]/30 bg-[#10B981]/[0.12] text-[#34D399]'
                  : 'border-[#EF4444]/30 bg-[#EF4444]/[0.12] text-[#FCA5A5]'
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {mask(`${formatChange(metrics.change24hPct)} (${formatPrice(uplUsd)})`)}
            </span>
            <span className="tnum text-[13px] font-medium text-[#CBD5E1]">
              Realized <span className="font-bold text-white">{mask('$0.00')}</span>
              <span className="mx-1.5 text-white/20">·</span>
              Unrealized <span className={`font-bold ${isPositive ? 'text-[#34D399]' : 'text-[#FCA5A5]'}`}>{mask(formatPrice(uplUsd))}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setHidden((v) => !v)}
          aria-pressed={hidden}
          aria-label={hidden ? 'Show balance' : 'Hide balance'}
          className="flex min-h-[36px] items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1E293B] px-4 text-[13px] font-bold text-[#CBD5E1] transition-colors hover:border-white/[0.16] hover:text-white"
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {hidden ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onSend}
          className="chrome-btn flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-[13px] font-extrabold"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
        <button
          onClick={onReceive}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#0F172A] px-3 text-[13px] font-bold text-[#CBD5E1] transition-colors hover:border-white/[0.16] hover:text-white"
        >
          <QrCode className="h-4 w-4" />
          Receive
        </button>
        <button
          onClick={onSwap}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#1E293B] px-3 text-[13px] font-bold text-white transition-colors hover:border-white/[0.16]"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </button>
      </div>
    </motion.section>
  );
}
