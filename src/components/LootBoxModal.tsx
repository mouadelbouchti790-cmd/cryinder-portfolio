import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Flame, X, Coins, Diamond, Gem, Dices } from 'lucide-react';
import type { LootBoxResult, LootTierConfig } from '../services/pocketbase';
import { LOOT_TIERS, getTierConfig } from '../services/pocketbase';
import { useLootBox } from '../hooks/useLootBox';
import LootBoxDisplay from './LootBoxDisplay';
import RevealAnimation from './RevealAnimation';

const TIER_ICONS: Record<LootTierConfig['icon'], typeof Coins> = {
  coin: Coins,
  diamond: Diamond,
  flame: Flame,
  gem: Gem,
  slot: Dices,
};

interface LootBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onPointsUpdated?: () => void;
}

type Phase = 'idle' | 'shaking' | 'opening' | 'reveal' | 'result';

const SHAKE_MS = 1400;
const OPEN_MS = 900;

export default function LootBoxModal({ isOpen, onClose, userId, onPointsUpdated }: LootBoxModalProps) {
  const {
    available,
    streak,
    totalOpened,
    cooldownHours,
    cooldownMinutes,
    history,
    loading,
    error,
    open,
  } = useLootBox(userId);

  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<LootBoxResult | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc + focus trap + restore
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhase('idle');
        setResult(null);
        setOpenError(null);
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const previouslyFocused = document.activeElement as HTMLElement | null;
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
      window.clearTimeout(timer);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  const handleOpen = useCallback(async () => {
    if (!available || phase !== 'idle') return;

    setPhase('shaking');
    setOpenError(null);

    const res = await open();

    if (!res) {
      setPhase('idle');
      setOpenError('Failed to open box. Try again.');
      return;
    }

    // Keep shaking until the server round-trip completes + min shake time
    window.setTimeout(() => {
      setPhase('opening');

      window.setTimeout(() => {
        setResult(res);
        setPhase('reveal');
        onPointsUpdated?.();
      }, OPEN_MS);
    }, Math.max(0, SHAKE_MS - 0));
  }, [available, phase, open, onPointsUpdated]);

  const handleRevealComplete = useCallback(() => {
    setPhase('result');
  }, []);

  const handleClose = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setOpenError(null);
    onClose();
  }, [onClose]);

  const multiplier =
    streak >= 15 ? 10 : Math.round((1 + ((Math.max(streak, 1) - 1) / 14) * 9) * 10) / 10;

  const cooldownText =
    cooldownHours > 0 ? `${cooldownHours}h ${cooldownMinutes}m` : `${cooldownMinutes}m`;

  const streakPct = Math.min(streak / 15, 1);

  const displayTier = result ? getTierConfig(result.tier) : getTierConfig('common');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Loot Box"
            className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0a] shadow-[0_0_80px_rgba(245,158,11,0.15),0_20px_60px_rgba(0,0,0,0.5)]"
          >
            {/* Ambient top glow tinted by current tier during reveal */}
            <div
              className="pointer-events-none absolute top-0 left-[10%] right-[10%] h-40 transition-colors duration-700"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${
                  phase === 'reveal' || phase === 'result' ? displayTier.color : '#F59E0B'
                }14, transparent 70%)`,
              }}
            />

            {/* ═══════ HEADER ═══════ */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-2.5">
                <Gift className="h-6 w-6 text-amber-400" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-black tracking-[-0.02em]">Loot Box</h2>
                  <span className="text-[11px] font-semibold text-white/50">Daily Reward</span>
                </div>
              </div>

              <button
                ref={closeBtnRef}
                onClick={handleClose}
                aria-label="Close loot box"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/55 transition-colors hover:text-white/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* ═══════ STREAK BAR ═══════ */}
            <div className="relative z-10 px-5 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  {streak} day{streak !== 1 ? 's' : ''} streak
                </span>
                <span className="text-xs font-bold text-amber-400">{multiplier}x bonus</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${streakPct * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
                />
              </div>

              <div className="mt-1 flex justify-between text-[11px] font-semibold text-white/35">
                <span>1x</span>
                <span>10x</span>
              </div>
            </div>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <div className="relative z-10 flex flex-col items-center px-5 pb-6 pt-5">
              <AnimatePresence mode="wait">
                {/* ─── IDLE: crate + tier grid ─── */}
                {phase === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full flex-col items-center"
                  >
                    <LootBoxDisplay phase="idle" available={available} accent="#F59E0B" />

                    {error || openError ? (
                      <div className="mb-3 mt-2 text-center text-[13px] font-semibold text-red-400">
                        {error || openError}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-center"
                      >
                        <div
                          className={`text-[13px] font-extrabold uppercase tracking-[0.14em] ${
                            available ? 'text-emerald-400 animate-pulse' : 'text-white/35'
                          }`}
                        >
                          {available ? 'Ready to open' : `Available in ${cooldownText}`}
                        </div>
                      </motion.div>
                    )}

                    {/* Possible rewards — collapsed into a single quiet strip */}
                    <div className="mt-3 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                      <div className="grid grid-cols-5 gap-2">
                        {LOOT_TIERS.map((t) => {
                          const TierGlyph = TIER_ICONS[t.icon];
                          return (
                            <div
                              key={t.tier}
                              className="flex flex-col items-center"
                              title={`${t.label}: ${t.minReward.toLocaleString()}-${t.maxReward.toLocaleString()} CP (${t.chancePct}% chance)`}
                            >
                              <TierGlyph
                                size={14}
                                style={{ color: t.color }}
                                aria-hidden="true"
                              />
                              <span
                                className="mt-1 text-[9px] font-extrabold tabular-nums text-white/45"
                              >
                                {t.chancePct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-center text-[10px] font-semibold text-white/30">
                        {multiplier > 1
                          ? `${multiplier}x streak bonus applied on top`
                          : 'Streak bonuses up to 10x'}
                      </div>
                    </div>

                    {/* Open button — primary CTA */}
                    <motion.button
                      whileHover={available ? { scale: 1.03 } : {}}
                      whileTap={available ? { scale: 0.96 } : {}}
                      onClick={handleOpen}
                      disabled={!available || phase !== 'idle' || loading}
                      className="mt-4 w-full rounded-2xl px-10 py-3.5 text-base font-extrabold tracking-[-0.01em] transition-all disabled:cursor-not-allowed"
                      style={{
                        background: available
                          ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                          : 'rgba(255,255,255,0.06)',
                        color: available ? '#000' : 'rgba(255,255,255,0.18)',
                        boxShadow: available ? '0 4px 24px rgba(245,158,11,0.4)' : 'none',
                      }}
                    >
                      {available ? 'Open Loot Box' : `${cooldownText} remaining`}
                    </motion.button>

                    {/* Streak + history footer — compressed */}
                    <div className="mt-3 flex w-full items-center justify-between px-2 text-[11px]">
                      <span className="text-white/30">
                        Opened <strong className="text-white/70 tabular-nums">{totalOpened}</strong>
                      </span>
                      <span className="text-white/30">
                        Streak{' '}
                        <strong className="text-amber-400 tabular-nums">{streak}</strong>
                      </span>
                    </div>

                    {history.length > 0 && (
                      <div className="mt-2.5 flex w-full gap-1.5">
                        {history.slice(0, 5).map((h) => (
                          <div
                            key={h.id}
                            className="flex flex-1 flex-col items-center gap-0.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-1 py-1 text-center"
                          >
                            <div className="text-[11px] font-extrabold text-white/80 tabular-nums">
                              +{h.amount >= 1000 ? `${(h.amount / 1000).toFixed(1)}k` : h.amount}
                            </div>
                            <div className="flex items-center gap-1 text-[8px] font-semibold text-white/30">
                              {h.source === 'jackpot' ? (
                                <Dices className="h-2.5 w-2.5 text-[#F43F5E]" aria-hidden="true" />
                              ) : (
                                <Gift className="h-2.5 w-2.5 text-amber-400" aria-hidden="true" />
                              )}
                              {h.source === 'jackpot' ? 'JP' : 'Box'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ─── SHAKING: crate wobbles ─── */}
                {phase === 'shaking' && (
                  <motion.div
                    key="shaking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-4"
                  >
                    <LootBoxDisplay phase="shaking" available={true} accent="#F59E0B" size={110} />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="mt-6 text-sm font-bold text-amber-400"
                    >
                      Shaking...
                    </motion.div>
                  </motion.div>
                )}

                {/* ─── OPENING: lid pops, beam shoots ─── */}
                {phase === 'opening' && (
                  <motion.div
                    key="opening"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-4"
                  >
                    <LootBoxDisplay phase="opening" available={true} accent="#F59E0B" size={110} />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="mt-6 text-sm font-bold text-amber-400"
                    >
                      Opening...
                    </motion.div>
                  </motion.div>
                )}

                {/* ─── REVEAL: slot machine + card flip ─── */}
                {phase === 'reveal' && result && (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex w-full flex-col items-center py-2"
                  >
                    <RevealAnimation result={result} onComplete={handleRevealComplete} />
                  </motion.div>
                )}

                {/* ─── RESULT: full breakdown ─── */}
                {phase === 'result' && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex w-full flex-col items-center"
                  >
                    <RevealAnimation result={result} static />

                    {/* Bonus CP badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-4 py-1.5 text-[12px] font-semibold text-amber-400/90"
                    >
                      <Gift className="mr-1.5 inline-block h-3.5 w-3.5" aria-hidden="true" />
                      Bonus CP, does not count toward your hourly swipe limit
                    </motion.div>

                    {/* Breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div className="mb-1.5 flex justify-between text-[13px] text-white/60">
                        <span>Base reward</span>
                        <span className="font-bold text-white">
                          {result.baseReward.toLocaleString()} CP
                        </span>
                      </div>
                      {result.bonusReward > 0 && (
                        <div className="mb-1.5 flex justify-between text-[13px] text-white/60">
                          <span>Streak bonus ({result.streakMultiplier}x)</span>
                          <span className="font-bold" style={{ color: displayTier.color }}>
                            +{result.bonusReward.toLocaleString()} CP
                          </span>
                        </div>
                      )}
                      <div className="my-2 h-px bg-white/[0.06]" />
                      <div className="flex justify-between text-sm">
                        <span className="font-extrabold text-white">Total</span>
                        <span className="font-black" style={{ color: displayTier.color }}>
                          {result.totalReward.toLocaleString()} CP
                        </span>
                      </div>
                    </motion.div>

                    {/* Streak update */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 text-center"
                    >
                      <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                        <Flame className="h-4 w-4 text-amber-400" aria-hidden="true" />
                        {result.streak} day streak · {result.streakMultiplier}x bonus
                      </span>
                    </motion.div>

                    {/* Done button */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleClose}
                      className="mt-5 rounded-2xl border border-white/[0.12] bg-white/[0.06] px-10 py-3.5 text-base font-extrabold tracking-[-0.01em]"
                    >
                      Claim
                    </motion.button>

                    <div className="mt-3 text-xs text-white/35">
                      Total boxes opened:{' '}
                      <strong className="text-white/60">{result.totalOpened}</strong>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
