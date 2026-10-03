import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { X, ArrowDown, RefreshCw, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import type { PortfolioHolding } from '../types/token';
import { formatPrice, formatBalance } from '../utils/formatters';
import { getQuote, executeSwap, getMintDecimals, humanizeSwapError, type SwapQuote, type SwapResult } from '../services/jupiter';
import TokenLogo from './ui/TokenLogo';

interface SwapModalProps {
  holdings: PortfolioHolding[];
  defaultFromMint?: string | null;
  walletAddress?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

type QuoteState = 'idle' | 'loading' | 'ready' | 'error';
type SwapState = 'idle' | 'swapping' | 'done' | 'error';

export default function SwapModal({ holdings, defaultFromMint, walletAddress, onClose, onSuccess }: SwapModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const options = useMemo(() => {
    const hasSol = holdings.some((h) => h.mint === SOL_MINT);
    const list = [...holdings];
    if (!hasSol) {
      list.unshift({ mint: SOL_MINT, name: 'Solana', symbol: 'SOL', logoUrl: '', balance: 0, decimals: 9, priceUsd: 0, valueUsd: 0, priceChange24h: 0 });
    }
    return list;
  }, [holdings]);

  const [fromMint, setFromMint] = useState(defaultFromMint ?? options[0]?.mint ?? SOL_MINT);
  const [toMint, setToMint] = useState(options[1]?.mint ?? options[0]?.mint ?? SOL_MINT);
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>('idle');
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [swapState, setSwapState] = useState<SwapState>('idle');
  const [swapError, setSwapError] = useState<string | null>(null);
  const [result, setResult] = useState<SwapResult | null>(null);
  const aliveRef = useRef(true);
  useEffect(() => { aliveRef.current = true; return () => { aliveRef.current = false; }; }, []);

  const fromHolding = options.find((h) => h.mint === fromMint);
  const toHolding = options.find((h) => h.mint === toMint);
  const taker = publicKey?.toBase58() ?? walletAddress ?? null;

  useEffect(() => {
    if (fromMint === toMint) {
      const alt = options.find((h) => h.mint !== fromMint);
      if (alt) setToMint(alt.mint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromMint]);

  // Debounced quote
  useEffect(() => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !taker || fromMint === toMint) {
      setQuote(null);
      setQuoteState('idle');
      return;
    }
    setQuoteState('loading');
    setQuoteError(null);
    const t = setTimeout(async () => {
      try {
        const decimals = fromHolding?.decimals ?? (fromMint === SOL_MINT ? 9 : await getMintDecimals(connection, fromMint));
        const raw = Math.floor(amt * 10 ** decimals);
        if (raw <= 0) throw new Error('Amount too small.');
        const q = await getQuote({ inputMint: fromMint, outputMint: toMint, amount: raw, userPublicKey: taker });
        if (!aliveRef.current) return;
        setQuote(q);
        setQuoteState('ready');
      } catch (e: any) {
        if (!aliveRef.current) return;
        setQuoteError(humanizeSwapError(e));
        setQuoteState('error');
      }
    }, 500);
    return () => clearTimeout(t);
  }, [amount, fromMint, toMint, taker, connection, fromHolding]);

  const amountNum = parseFloat(amount) || 0;
  const insufficient = fromHolding ? amountNum > fromHolding.balance : false;
  const canQuote = quoteState === 'ready' && !!quote && !insufficient;

  const handleSwap = async () => {
    if (!quote || !signTransaction || !taker) return;
    setSwapError(null);
    setSwapState('swapping');
    try {
      const r = await executeSwap({ quote, signTransaction: signTransaction as any, connection });
      if (!aliveRef.current) return;
      setResult(r);
      setSwapState(r.status === 'Success' ? 'done' : 'error');
      if (r.status === 'Success') onSuccess?.();
      else setSwapError(r.error || 'Swap failed.');
    } catch (e: any) {
      if (!aliveRef.current) return;
      setSwapError(humanizeSwapError(e));
      setSwapState('error');
    }
  };

  const outEstimate = quote ? Number(quote.outAmount) / 10 ** (toHolding?.decimals ?? 6) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose} role="dialog" aria-modal="true" aria-label="Swap tokens"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-sheet w-full max-w-[420px] rounded-[4px] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-bold text-white">Swap</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-[3px] p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!taker && (
          <p className="mb-3 rounded-[3px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] px-3 py-2 text-xs text-[#EF4444]">
            Connect a wallet to swap. Quotes are preview-only.
          </p>
        )}

        {/* From */}
        <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A9AB2]">From</label>
        <div className="mt-1 flex gap-2">
          <select
            value={fromMint} onChange={(e) => setFromMint(e.target.value)}
            className="min-h-[44px] w-[140px] shrink-0 rounded-[3px] border border-white/[0.08] bg-[#010409] px-2 text-[13px] font-bold text-white outline-none"
          >
            {options.map((h) => (
              <option key={h.mint} value={h.mint}>{h.symbol}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <input
              value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00" inputMode="decimal"
              className="tnum min-h-[44px] w-full rounded-[3px] border border-white/[0.08] bg-[#010409] px-3 pr-14 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-white/[0.16]"
            />
            <button
              onClick={() => fromHolding && setAmount(String(fromHolding.balance))}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[3px] bg-white/[0.06] px-2 py-1 text-[10px] font-extrabold text-white/70 hover:text-white"
            >
              MAX
            </button>
          </div>
        </div>
        {fromHolding && (
          <p className="tnum mt-1 text-[11px] text-[#8A9AB2]">
            Balance {formatBalance(fromHolding.balance)} {fromHolding.symbol}
            {insufficient && <span className="ml-2 font-bold text-[#EF4444]">Insufficient</span>}
          </p>
        )}

        <div className="my-3 flex justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-white/[0.08] bg-[#0F1D33]">
            <ArrowDown className="h-3.5 w-3.5 text-white/60" />
          </span>
        </div>

        {/* To */}
        <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A9AB2]">To</label>
        <div className="mt-1 flex items-center gap-2 rounded-[3px] border border-white/[0.08] bg-[#010409] px-3 py-3">
          {toHolding && <TokenLogo src={toHolding.logoUrl} alt={toHolding.symbol} />}
          <select
            value={toMint} onChange={(e) => setToMint(e.target.value)}
            className="min-h-[24px] flex-1 bg-transparent text-[13px] font-bold text-white outline-none"
          >
            {options.filter((h) => h.mint !== fromMint).map((h) => (
              <option key={h.mint} value={h.mint} className="bg-[#0A1326]">{h.symbol} — {h.name}</option>
            ))}
          </select>
          <span className="tnum text-sm font-bold text-white">
            {quoteState === 'loading' ? '…' : outEstimate !== null ? outEstimate.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '—'}
          </span>
        </div>
        {quote && (
          <div className="tnum mt-2 space-y-1 text-[11px] text-[#8A9AB2]">
            <div className="flex justify-between">
              <span>Est. receive</span>
              <span className="font-bold text-white">{outEstimate?.toLocaleString('en-US', { maximumFractionDigits: 6 })} {toHolding?.symbol}</span>
            </div>
            {quote.priceImpactPct !== undefined && (
              <div className="flex justify-between">
                <span>Price impact</span>
                <span className={quote.priceImpactPct > 2 ? 'font-bold text-[#EF4444]' : 'text-[#CBD5E1]'}>{quote.priceImpactPct.toFixed(2)}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Fee (1%)</span>
              <span className="text-[#CBD5E1]">incl. in route</span>
            </div>
            {toHolding?.priceUsd ? (
              <div className="flex justify-between">
                <span>Value</span>
                <span className="text-[#CBD5E1]">{outEstimate !== null ? formatPrice(outEstimate * (toHolding.priceUsd || 0)) : '—'}</span>
              </div>
            ) : null}
          </div>
        )}
        {quoteState === 'error' && (
          <p className="mt-2 rounded-[3px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] px-3 py-2 text-xs text-[#EF4444]">{quoteError}</p>
        )}

        {swapState === 'done' && result && (
          <div className="mt-3 flex items-center gap-2 rounded-[3px] border border-[#10B981]/30 bg-[#10B981]/[0.08] px-3 py-2.5 text-xs font-bold text-[#10B981]">
            <Check className="h-4 w-4" />
            Swapped
            <a href={`https://solscan.io/tx/${result.signature}`} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 underline-offset-2 hover:underline">
              Solscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {swapState === 'error' && swapError && (
          <p className="mt-2 flex items-center gap-2 rounded-[3px] border border-[#EF4444]/30 bg-[#EF4444]/[0.08] px-3 py-2 text-xs text-[#EF4444]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {swapError}
          </p>
        )}

        <button
          onClick={handleSwap}
          disabled={!canQuote || swapState === 'swapping' || !taker}
          className="chrome-btn mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[3px] px-4 text-sm font-extrabold disabled:opacity-50"
        >
          {swapState === 'swapping' ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
          {swapState === 'swapping' ? 'Swapping…' : !taker ? 'Connect wallet to swap' : insufficient ? 'Insufficient balance' : quoteState === 'loading' ? 'Getting quote…' : 'Swap'}
        </button>
      </motion.div>
    </motion.div>
  );
}
