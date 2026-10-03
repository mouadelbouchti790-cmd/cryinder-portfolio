import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type BoxPhase = 'idle' | 'shaking' | 'opening' | 'open';

interface LootBoxDisplayProps {
  phase: BoxPhase;
  available: boolean;
  accent: string;
  size?: number;
}

/**
 * Stylized CSS crate with a lid. Phases:
 * - idle: gentle float + pulse glow
 * - shaking: fast wobble, glow ramps up
 * - opening: lid pops off, light beam shoots out
 * - open: lid gone, beam fades, sparkles float
 */
export default function LootBoxDisplay({
  phase,
  available,
  accent,
  size = 96,
}: LootBoxDisplayProps) {
  const scale = size / 96;
  const lidH = 34 * scale;
  const bodyH = 62 * scale;

  const shake = phase === 'shaking';
  const opening = phase === 'opening' || phase === 'open';

  return (
    <div
      className="relative"
      style={{ width: size, height: size + 10 }}
      aria-hidden="true"
    >
      {/* Light beam on open */}
      {opening && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 1, 0.4], scaleY: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          style={{
            width: size * 0.55,
            height: size * 1.9,
            transformOrigin: 'bottom',
            background: `linear-gradient(to top, ${accent}55, transparent)`,
            filter: `blur(6px)`,
            borderRadius: '999px 999px 0 0',
          }}
        />
      )}

      {/* Wrapper with shake animation */}
      <motion.div
        className="absolute inset-0"
        animate={
          shake
            ? {
                rotate: [0, -6, 6, -8, 8, -4, 4, 0],
                scale: [1, 1.03, 0.97, 1.05, 0.98, 1.02, 1],
              }
            : phase === 'idle' && available
              ? { y: [0, -4, 0] }
              : {}
        }
        transition={
          shake
            ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Glow under crate */}
        <motion.div
          className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size * 1.4, height: size * 1.4, background: `${accent}22`, filter: 'blur(18px)' }}
          animate={
            shake
              ? { opacity: [0.4, 1, 0.6, 1, 0.5], scale: [1, 1.25, 1.05, 1.3, 1.1] }
              : { opacity: available ? [0.35, 0.6, 0.35] : 0.15, scale: [1, 1.08, 1] }
          }
          transition={{ duration: shake ? 0.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Lid ── */}
        <motion.div
          className="absolute left-1/2 top-0 -translate-x-1/2 rounded-t-lg"
          style={{
            width: size,
            height: lidH,
            background: `linear-gradient(180deg, #3a3a3e, #26262a)`,
            border: '2px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            boxShadow: `inset 0 2px 6px rgba(255,255,255,0.06), 0 0 ${shake ? 24 : 12}px ${accent}44`,
          }}
          animate={
            phase === 'opening' || phase === 'open'
              ? {
                  y: -size * 0.9,
                  rotate: -18,
                  opacity: phase === 'open' ? 0.6 : 1,
                  transition: { type: 'spring', stiffness: 260, damping: 14 },
                }
              : { y: 0, rotate: 0 }
          }
        >
          {/* Lid handle */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md"
            style={{
              width: size * 0.36,
              height: size * 0.16,
              background: 'linear-gradient(180deg, #4a4a50, #303034)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
        </motion.div>

        {/* ── Body ── */}
        <div
          className="absolute left-1/2 top-[26%] -translate-x-1/2 rounded-b-lg"
          style={{
            width: size,
            height: bodyH,
            background: 'linear-gradient(180deg, #2c2c30, #1c1c1f)',
            border: '2px solid rgba(255,255,255,0.08)',
            boxShadow: `inset 0 -6px 14px rgba(0,0,0,0.5), inset 0 4px 8px rgba(255,255,255,0.04), 0 0 ${shake ? 28 : 14}px ${accent}33`,
          }}
        >
          {/* Front panel accent stripe */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded"
            style={{
              width: size * 0.55,
              height: size * 0.22,
              background: `linear-gradient(90deg, ${accent}66, ${accent}22, ${accent}66)`,
              border: `1px solid ${accent}44`,
              boxShadow: `0 0 12px ${accent}33`,
            }}
          />
          {/* Lock dots */}
          <div className="absolute bottom-[12%] left-1/2 flex -translate-x-1/2 gap-[6px]">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `${accent}88` }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Sparkles during opening */}
      {phase === 'open' && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="absolute inline-flex"
              style={{ left: '50%', top: '20%' }}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [(i - 2.5) * 18, (i - 2.5) * 34],
                y: [0, -40 - i * 12],
              }}
              transition={{
                duration: 1.2 + i * 0.15,
                repeat: Infinity,
                delay: i * 0.12,
              }}
            >
              <Sparkles
                className="h-3.5 w-3.5"
                style={{ color: accent }}
                aria-hidden="true"
              />
            </motion.span>
          ))}
        </>
      )}
    </div>
  );
}
