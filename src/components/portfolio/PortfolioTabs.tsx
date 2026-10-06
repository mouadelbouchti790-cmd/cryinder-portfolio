import { motion } from 'framer-motion';

export type PortfolioView = 'tokens' | 'token-activity' | 'movers';

export const PORTFOLIO_VIEWS: { id: PortfolioView; label: string }[] = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'token-activity', label: 'Token Activity' },
  { id: 'movers', label: 'Top Movers' },
];

interface PortfolioTabsProps {
  active: PortfolioView;
  onChange: (v: PortfolioView) => void;
  counts?: Partial<Record<PortfolioView, number>>;
}

export default function PortfolioTabs({ active, onChange, counts }: PortfolioTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Portfolio views"
      className="flex gap-0.5 overflow-x-auto rounded-[4px] border border-white/[0.08] bg-[#111827] p-1"
    >
      {PORTFOLIO_VIEWS.map((v) => {
        const isActive = v.id === active;
        const count = counts?.[v.id];
        return (
          <button
            key={v.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(v.id)}
            className={`relative flex min-h-[40px] shrink-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[3px] px-3 text-[13px] font-semibold transition-colors duration-180 ${
              isActive ? 'bg-[#3B82F6] text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] tab-active-sheen' : 'text-[#9CA3AF] hover:text-[#3B82F6]'
            }`}
          >
            {isActive && (
              <>
                <motion.span
                  layoutId="portfolio-tab-sheen"
                  className="absolute inset-x-3 top-0 h-[2px] bg-white/90"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </>
            )}
            {v.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={`tnum rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/[0.12] text-white/80' : 'bg-white/[0.05] text-white/35'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
