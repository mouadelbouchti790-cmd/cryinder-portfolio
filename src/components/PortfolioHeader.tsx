import { useEffect, useState } from 'react';
import { motion, animate, useReducedMotion } from 'framer-motion';
import { TrendingUp, TrendingDown, Coins, Trophy, Sparkles } from 'lucide-react';
import type { PortfolioMetrics } from '../types/token';
import { formatPrice, formatChange } from '../utils/formatters';
import TokenLogo from './ui/TokenLogo';

interface PortfolioHeaderProps {
  metrics: PortfolioMetrics;
  cpBalance: number;
  loading: boolean;
}

/* ── Animated currency ──────────────────────────────────────────── */

function AnimatedCurrency({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(display, value, {
      duration: 0.8,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <>{formatPrice(display)}</>;
}

/* ── Header skeleton ────────────────────────────────────────────── */

function PortfolioHeaderSkeleton() {
  return (
    <div
      className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6"
      aria-busy="true"
      aria-label="Loading portfolio summary"
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="mt-4 h-11 w-52 animate-pulse rounded-lg bg-white/[0.08]" />
      <div className="mt-5 flex gap-2">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────── */

export default function PortfolioHeader({ metrics, cpBalance, loading }: PortfolioHeaderProps) {
  if (loading) return <PortfolioHeaderSkeleton />;

  const { totalValueUsd, change24hPct, topPerformer } = metrics;
  const isPositive = change24hPct >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(226,232,240,0.06), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/35">
            Total Portfolio Value
          </span>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
              isPositive
                ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-400'
                : 'border-[#E0827A]/20 bg-[#E0827A]/[0.06] text-[#E0827A]'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="tabular-nums">{formatChange(change24hPct)}</span>
          </motion.div>
        </div>

        <div className="mt-3 text-[40px] font-black leading-none tracking-[-0.03em] tabular-nums sm:text-[48px]">
          <AnimatedCurrency value={totalValueUsd} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {/* CP balance */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-400/[0.06]">
              <Coins className="h-4 w-4 text-amber-400/80" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-extrabold tabular-nums leading-tight">
                {cpBalance.toLocaleString()} CP
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Your balance
              </div>
            </div>
          </motion.div>

          {/* Top performer */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            {topPerformer ? (
              <>
                <div className="relative shrink-0">
                  <TokenLogo src={topPerformer.logoUrl} alt={topPerformer.symbol} size="sm" />
                  <span className="absolute -right-1 -top-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-400/90" aria-hidden="true" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-extrabold leading-tight">
                    {topPerformer.symbol}
                  </div>
                  <div
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      topPerformer.priceChange24h >= 0 ? 'text-emerald-400/80' : 'text-[#E0827A]/80'
                    }`}
                  >
                    Top · {formatChange(topPerformer.priceChange24h)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                  <Sparkles className="h-4 w-4 text-white/25" aria-hidden="true" />
                </div>
                <div className="text-xs font-semibold text-white/30">No top performer yet</div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
