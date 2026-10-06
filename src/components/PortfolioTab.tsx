import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, X, AlertTriangle } from 'lucide-react';
import type { PortfolioHolding, PortfolioMetrics } from '../types/token';
import PortfolioHero from './portfolio/PortfolioHero';
import PortfolioTabs, { type PortfolioView } from './portfolio/PortfolioTabs';
import PortfolioDataTable from './portfolio/PortfolioDataTable';
import PortfolioEmptyState from './portfolio/PortfolioEmptyState';
import TokenDetailModal from './TokenDetailModal';
import SellModal from './SellModal';
import SendModal from './SendModal';
import ReceiveModal from './ReceiveModal';
import SwapModal from './SwapModal';
import TokenLogo from './ui/TokenLogo';

interface PortfolioTabProps {
  holdings: PortfolioHolding[];
  metrics: PortfolioMetrics;
  cpBalance: number;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
  onRetry: () => void;
  onRefresh: () => void;
  walletAddress?: string | null;
  onDisconnect?: () => void;
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#111827]" aria-busy="true" aria-label="Loading tokens">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4 last:border-0">
          <div className="navy-skeleton h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <div className="navy-skeleton mb-1.5 h-4 w-28 rounded" />
            <div className="navy-skeleton h-3 w-20 rounded" />
          </div>
          <div className="navy-skeleton h-6 w-16 rounded-full" />
          <div className="text-right">
            <div className="navy-skeleton mb-1.5 ml-auto h-4 w-20 rounded" />
            <div className="navy-skeleton ml-auto h-3 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioTab({
  holdings,
  metrics,
  cpBalance,
  loading,
  refreshing,
  error,
  lastUpdated,
  onRetry,
  onRefresh,
  walletAddress,
  onDisconnect,
}: PortfolioTabProps) {
  const [view, setView] = useState<PortfolioView>('tokens');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PortfolioHolding | null>(null);
  const [sellHolding, setSellHolding] = useState<PortfolioHolding | null>(null);
  const [sendHolding, setSendHolding] = useState<PortfolioHolding | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [sendPickerOpen, setSendPickerOpen] = useState(false);

  void cpBalance;
  void onDisconnect;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = holdings;
    if (view === 'movers') base = [...holdings].sort((a, b) => b.priceChange24h - a.priceChange24h);
    if (!q) return base;
    return base.filter((h) => h.name.toLowerCase().includes(q) || h.symbol.toLowerCase().includes(q));
  }, [holdings, query, view]);

  const time = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        <PortfolioHero metrics={metrics} loading />
        <div className="h-[52px] rounded-sm border border-white/[0.08] bg-[#111827]" />
        <TableSkeleton />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="space-y-4">
        <PortfolioHero metrics={metrics} loading={false} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-md border border-[#EF4444]/30 bg-[#EF4444]/[0.06] px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#EF4444]/30 bg-[rgba(239,68,68,0.12)]">
            <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
          </div>
          <h3 className="text-base font-bold text-[#EF4444]">Failed to load portfolio</h3>
          <p className="mb-6 mt-1 max-w-[300px] text-[13px] text-[#E5E7EB]">{error}</p>
          <button onClick={onRetry} className="min-h-[44px] rounded-sm bg-[#3B82F6] px-8 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors hover:bg-[#2563EB]">
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Disconnected / empty wallet ──
  if (!walletAddress) {
    return (
      <div className="space-y-4">
        <PortfolioEmptyState mode="disconnected" onConnect={onRetry} />
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="space-y-4">
        <PortfolioHero metrics={metrics} loading={false} />
        <PortfolioEmptyState mode="no-tokens" onRefresh={onRetry} />
      </div>
    );
  }

  const isPlaceholderView = view === 'token-activity';

  return (
    <div className="space-y-4">
      <PortfolioHero
        metrics={metrics}
        loading={false}
        onSend={() => setSendPickerOpen(true)}
        onReceive={() => setReceiveOpen(true)}
        onSwap={() => setSwapOpen(true)}
      />

      <PortfolioTabs
        active={view}
        onChange={setView}
        counts={{ tokens: holdings.length, movers: holdings.length }}
      />

      {isPlaceholderView ? (
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[4px] border border-white/[0.08] bg-[#111827] px-6 py-14 text-center"
        >
          <h3 className="text-base font-bold text-white">
            No token activity yet
          </h3>
          <p className="mx-auto mb-6 mt-1 max-w-[300px] text-[13px] text-[#9CA3AF]">
            Swaps, sends and receives for this wallet will stream in here.
          </p>
          <button
            onClick={onRefresh}
            className="flex min-h-[40px] items-center gap-2 rounded-[3px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-5 py-2 text-xs font-bold text-[#F9FAFB] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </motion.div>
      ) : (
        <>
          {/* Search — glow focal state */}
          <div className="search-glow relative rounded-[3px] border border-white/[0.08] bg-[#111827] transition-shadow">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === 'movers' ? 'Search top movers…' : 'Search tokens…'}
              aria-label="Search tokens"
              className="tnum w-full bg-transparent py-3 pl-10 pr-9 text-sm font-medium text-white placeholder:text-white/25 outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <PortfolioEmptyState mode="no-results" query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <PortfolioDataTable holdings={filtered} onOpen={setSelected} />
            </AnimatePresence>
          )}

          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-[3px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-5 py-2.5 text-xs font-bold text-[#F9FAFB] transition-colors hover:border-[rgba(255,255,255,0.16)] hover:text-white disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            {time && (
              <span className="tnum text-[11px] font-medium text-[#9CA3AF]">
                {refreshing ? 'Updating…' : `Updated ${time}`}
              </span>
            )}
          </div>
        </>
      )}

      <TokenDetailModal holding={selected} cpBalance={cpBalance} onClose={() => setSelected(null)} />

      <AnimatePresence>
        {sellHolding && (
          <SellModal holding={sellHolding} onClose={() => setSellHolding(null)} onSuccess={() => onRefresh()} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sendHolding && (
          <SendModal holding={sendHolding} onClose={() => setSendHolding(null)} onSuccess={() => onRefresh()} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {receiveOpen && walletAddress && (
          <ReceiveModal walletAddress={walletAddress} onClose={() => setReceiveOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {swapOpen && (
          <SwapModal holdings={holdings} walletAddress={walletAddress} onClose={() => setSwapOpen(false)} onSuccess={() => onRefresh()} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sendPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center"
            onClick={() => setSendPickerOpen(false)} role="dialog" aria-modal="true" aria-label="Choose token to send"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-sheet w-full max-w-[400px] rounded-[4px] p-4"
            >
              <h3 className="mb-3 text-[15px] font-bold text-white">Send — choose token</h3>
              <ul className="max-h-[320px] space-y-1 overflow-y-auto">
                {holdings.map((h) => (
                  <li key={h.mint}>
                    <button
                      onClick={() => { setSendPickerOpen(false); setSendHolding(h); }}
                      className="flex w-full items-center gap-3 rounded-[3px] border border-[rgba(255,255,255,0.08)] bg-[#0B0F19] px-3 py-2.5 text-left transition-colors hover:border-[rgba(59,130,246,0.4)]"
                    >
                      <TokenLogo src={h.logoUrl} alt={h.symbol} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{h.symbol}</span>
                        <span className="tnum block text-[11px] text-[#9CA3AF]">{h.balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} available</span>
                      </span>
                      <span className="tnum text-[11px] font-bold text-[#9CA3AF]">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
