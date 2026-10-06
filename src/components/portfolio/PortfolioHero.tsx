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
      <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-6" aria-busy="true" aria-label="Loading portfolio summary">
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
      className="relative overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0F172A] p-6"
      aria-label="Portfolio summary"
      style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
      />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Total Balance
          </p>
          <p className="tnum mt-1 text-[30px] font-bold leading-none tracking-tight text-white">
            {mask(formatPrice(metrics.totalValueUsd))}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold tnum ${
                isPositive
                  ? 'border-[#10B981]/30 bg-[rgba(16,185,129,0.12)] text-[#10B981]'
                  : 'border-[#EF4444]/30 bg-[rgba(239,68,68,0.12)] text-[#EF4444]'
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {mask(`${formatChange(metrics.change24hPct)} (${formatPrice(uplUsd)})`)}
            </span>
            <span className="tnum text-[13px] font-medium text-[#E5E7EB]">
              Realized <span className="font-bold text-white">{mask('$0.00')}</span>
              <span className="mx-1.5 text-white/20">·</span>
              Unrealized <span className={`font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{mask(formatPrice(uplUsd))}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setHidden((v) => !v)}
          aria-pressed={hidden}
          aria-label={hidden ? 'Show balance' : 'Hide balance'}
          className="flex min-h-[36px] items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 text-[13px] font-bold text-[#F9FAFB] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:text-white"
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {hidden ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={onSend}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 text-[13px] font-bold text-[#F9FAFB] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:text-white"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
        <button
          onClick={onReceive}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-3 text-[13px] font-bold text-[#F9FAFB] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:text-white"
        >
          <QrCode className="h-4 w-4" />
          Receive
        </button>
        <button
          onClick={onSwap}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-transparent bg-[#3B82F6] px-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(59,130,246,0.35)] transition-colors hover:bg-[#2563EB]"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap
        </button>
      </div>
    </motion.section>
  );
}
