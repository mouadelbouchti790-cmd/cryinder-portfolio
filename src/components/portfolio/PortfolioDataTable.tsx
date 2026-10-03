import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { PortfolioHolding } from '../../types/token';
import { formatPrice, formatChange, formatBalance } from '../../utils/formatters';
import TokenLogo from '../ui/TokenLogo';

interface PortfolioDataTableProps {
  holdings: PortfolioHolding[];
  onOpen: (h: PortfolioHolding) => void;
}

export default function PortfolioDataTable({ holdings, onOpen }: PortfolioDataTableProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-white/[0.08] bg-[#0A1326]">
      {/* Header — 5 cols, no curves */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 border-b border-white/[0.08] bg-[#010409] px-4 py-2.5 md:grid">
        {['Asset', 'Price', '24h', 'Holdings', 'Value'].map((c, i) => (
          <span
            key={c}
            className={`text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A9AB2] ${i >= 1 ? 'text-right' : 'text-left'}`}
          >
            {c}
          </span>
        ))}
      </div>

      <ul className="divide-y divide-white/[0.06]">
        {holdings.map((h, i) => {
          const pos = h.priceChange24h > 0;
          const neg = h.priceChange24h < 0;
          const flat = h.priceChange24h === 0;
          return (
            <motion.li
              key={h.mint}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.18 }}
            >
              <button
                onClick={() => onOpen(h)}
                className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors duration-120 hover:bg-[#0F1D33] focus-visible:bg-[#0F1D33] md:grid-cols-[2fr_1fr_1fr_1fr_1fr]"
                aria-label={`Open ${h.name} details`}
              >
                {/* Asset */}
                <span className="flex min-w-0 items-center gap-3">
                  <TokenLogo src={h.logoUrl} alt={h.symbol} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{h.name}</span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#8A9AB2]">
                      {h.symbol}
                    </span>
                  </span>
                </span>

                {/* Mobile right: value + arrow number */}
                <span className="text-right md:hidden">
                  <span className="tnum block text-sm font-bold text-white">{formatPrice(h.valueUsd)}</span>
                  <span
                    className={`tnum inline-flex items-center justify-end gap-0.5 text-xs font-bold ${
                      flat ? 'text-white/40' : pos ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}
                  >
                    {flat ? <Minus className="h-3 w-3" /> : pos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {flat ? '0.00%' : formatChange(h.priceChange24h)}
                  </span>
                </span>

                {/* Desktop cells */}
                <span className="tnum hidden text-right text-sm text-[#CBD5E1] md:block">{formatPrice(h.priceUsd)}</span>
                <span className="hidden justify-end md:flex">
                  <span
                    className={`tnum inline-flex min-w-[86px] items-center justify-center gap-1 rounded-[3px] border px-2 py-1 text-xs font-bold ${
                      flat
                        ? 'border-white/[0.08] bg-white/[0.03] text-white/50'
                        : pos
                          ? 'border-[#10B981]/40 bg-[#10B981]/[0.12] text-[#10B981]'
                          : 'border-[#EF4444]/40 bg-[#EF4444]/[0.12] text-[#EF4444]'
                    }`}
                  >
                    {flat ? <Minus className="h-3 w-3" /> : pos ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {flat ? '0.00%' : formatChange(h.priceChange24h)}
                  </span>
                </span>
                <span className="tnum hidden text-right text-sm text-[#CBD5E1] md:block">{formatBalance(h.balance)}</span>
                <span className="tnum hidden text-right text-sm font-bold text-white md:block">{formatPrice(h.valueUsd)}</span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
