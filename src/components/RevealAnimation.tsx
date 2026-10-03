import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Diamond, Flame, Gem, Dices, PartyPopper } from 'lucide-react';
import type { LootBoxResult, LootTierConfig } from '../services/pocketbase';
import { LOOT_TIERS, getTierConfig } from '../services/pocketbase';
import { useLootBoxSounds } from '../hooks/useLootBox';

interface RevealAnimationProps {
  result: LootBoxResult;
  onComplete?: () => void;
  /** Static display (no spin cycle, no sounds) - used in the result phase */
  static?: boolean;
}

type RevealPhase = 'spinning' | 'landed';

const SPIN_MS = 1400;

const TIER_ICONS: Record<LootTierConfig['icon'], typeof Coins> = {
  coin: Coins,
  diamond: Diamond,
  flame: Flame,
  gem: Gem,
  slot: Dices,
};

function TierIcon({ icon, size }: { icon: LootTierConfig['icon']; size: number }) {
  const Icon = TIER_ICONS[icon];
  return <Icon size={size} aria-hidden="true" />;
}

/**
 * Slot-machine style reveal:
 * 1. Cycles through all tier labels quickly (spin sound plays)
 * 2. Slows down and lands on the actual tier
 * 3. Reward card flips in with a glow matching the tier color (coins sound)
 */
export default function RevealAnimation({ result, onComplete, static: isStatic = false }: RevealAnimationProps) {
  const [phase, setPhase] = useState<RevealPhase>(isStatic ? 'landed' : 'spinning');
  const [tick, setTick] = useState(0);
  const tier = getTierConfig(result.tier);
  const { play, stop } = useLootBoxSounds();

  // Rapid cycle through tiers during spin
  useEffect(() => {
    if (isStatic || phase !== 'spinning') return;

    play('spin');

    const fastInterval = setInterval(() => setTick((t) => t + 1), 70);
    const stopTimer = setTimeout(() => {
      clearInterval(fastInterval);
      stop('spin');
      play('coins');
      setPhase('landed');
      onComplete?.();
    }, SPIN_MS);

    return () => {
      clearInterval(fastInterval);
      clearTimeout(stopTimer);
      stop('spin');
    };
  }, [isStatic, phase, onComplete, play, stop]);

  // Slow-motion cycle near the end of the spin
  const cycledTier = LOOT_TIERS[tick % LOOT_TIERS.length];
  const displayTier = phase === 'spinning' ? cycledTier : tier;

  const isJackpot = result.tier === 'jackpot';
  const isRare = result.tier === 'legendary' || result.tier === 'epic' || isJackpot;

  return (
    <div className="flex w-full flex-col items-center">
      {/* Tier slot display */}
      <div className="mb-4 flex h-11 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-5">
        <motion.div
          key={`${phase}-${displayTier.tier}`}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.08 }}
          className="flex items-center gap-2 text-sm font-extrabold tracking-[0.12em] uppercase"
          style={{
            color: displayTier.color,
            textShadow: isRare ? `0 0 18px ${displayTier.color}88` : 'none',
          }}
        >
          <TierIcon icon={displayTier.icon} size={15} />
          {displayTier.label}
        </motion.div>
      </div>

      {/* Reward card flip */}
      <motion.div
        initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
        animate={
          phase === 'landed'
            ? { rotateY: 0, opacity: 1, scale: 1 }
            : { rotateY: 90, opacity: 0, scale: 0.9 }
        }
        transition={
          phase === 'landed'
            ? { type: 'spring', stiffness: 260, damping: 20 }
            : { duration: 0.15 }
        }
        className="relative w-full rounded-2xl border p-5 text-center"
        style={{
          borderColor: `${tier.color}44`,
          background: `linear-gradient(160deg, ${tier.color}14, rgba(10,10,11,0.9))`,
          boxShadow: isRare
            ? `0 0 32px ${tier.color}44, inset 0 1px 0 rgba(255,255,255,0.06)`
            : 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Glow burst for rare tiers */}
        {isRare && phase === 'landed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.9, 0.25], scale: [0.4, 1.6, 2.2] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: `radial-gradient(circle at 50% 40%, ${tier.color}33, transparent 65%)` }}
          />
        )}

        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={phase === 'landed' ? { scale: 1 } : { scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: phase === 'landed' ? 0.15 : 0 }}
            className="mb-2 text-5xl"
            style={{ filter: `drop-shadow(0 0 18px ${tier.color}88)` }}
          >
            <TierIcon icon={tier.icon} size={48} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={phase === 'landed' ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ delay: phase === 'landed' ? 0.28 : 0, duration: 0.4 }}
            className="text-4xl font-black tracking-[-0.03em]"
            style={{
              background:
                isJackpot
                  ? 'linear-gradient(135deg, #F43F5E, #FBBF24, #F43F5E)'
                  : `linear-gradient(135deg, #fff, ${tier.color})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            +{result.awardedCP.toLocaleString()} CP
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === 'landed' ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: phase === 'landed' ? 0.5 : 0 }}
            className="mt-2 text-[12px] font-semibold text-white/50"
          >
            Base {result.baseReward.toLocaleString()} CP
            {result.bonusReward > 0 && (
              <span className="text-white/60">
                {' '}
                · +{result.bonusReward.toLocaleString()} CP streak ({result.streakMultiplier}x)
              </span>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Jackpot banner */}
      {isJackpot && phase === 'landed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: [1, 1.04, 1] }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 300 }}
          className="mt-4 flex items-center gap-2 rounded-full border border-[#F43F5E]/40 bg-[#F43F5E]/10 px-6 py-2 text-sm font-black tracking-[0.08em] text-[#F43F5E]"
          style={{ boxShadow: '0 0 28px rgba(244,63,94,0.35)' }}
        >
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
          JACKPOT!
          <PartyPopper className="h-4 w-4" aria-hidden="true" />
        </motion.div>
      )}
    </div>
  );
}
