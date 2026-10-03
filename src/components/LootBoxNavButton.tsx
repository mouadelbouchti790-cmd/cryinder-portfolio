import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useLootBox } from '../hooks/useLootBox';

interface LootBoxNavButtonProps {
  onClick: () => void;
  active: boolean;
  userId: string | null;
}

export default function LootBoxNavButton({ onClick, active, userId }: LootBoxNavButtonProps) {
  const { available, streak } = useLootBox(userId);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label="Loot Box"
      className={`relative flex min-h-[48px] min-w-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-3 transition-colors ${
        active ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
      }`}
    >
      {/* Glow ring when available */}
      {available && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -inset-1 rounded-2xl border-2 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.5),inset_0_0_12px_rgba(245,158,11,0.5)]"
        />
      )}

      <Gift
        className={`h-5 w-5 ${available ? 'text-amber-400' : active ? 'text-white' : 'text-white/35'}`}
        aria-hidden="true"
      />

      {/* Streak badge */}
      {streak > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-extrabold text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]"
        >
          {streak}
        </motion.span>
      )}

      <span className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-white/35'}`}>
        Box
      </span>
    </motion.button>
  );
}
