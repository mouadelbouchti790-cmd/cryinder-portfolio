import Velaris from "./ui/velaris";
import { ArrowRight, ShieldCheck, Zap, Wallet } from "lucide-react";

interface VelarisLandingPageProps {
  onLaunchClick: () => void;
}

export default function LandingPage({ onLaunchClick }: VelarisLandingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-950/40 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold tracking-wider text-blue-500 text-lg">CRYINDER</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">SOLANA</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-mono text-zinc-400 hover:text-white transition-colors">FEATURES</a>
            <button
              onClick={onLaunchClick}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold px-4 py-2 rounded-sm transition-all shadow-lg shadow-blue-600/20">
              LAUNCH TERMINAL
            </button>
          </div>
        </div>
      </header>

      <section className="relative pt-16">
        <Velaris
          height="90vh"
          bg="#020617"
          colors={["#60a5fa", "#3b82f6", "#1d4ed8", "#020617"]}
          className="border-b border-blue-950/40"
        >
          <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-center px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-xs font-mono font-medium text-blue-400 backdrop-blur mb-6">
              <span>⚡ Wall Street Speed</span>
              <span className="text-blue-600">•</span>
              <span>Degen Velocity</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6">
              The Institutional <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600">
                Solana Trading Terminal
              </span>
            </h1>
            
            <p className="max-w-xl text-zinc-400 text-base sm:text-lg mb-10 font-normal leading-relaxed">
              Swipe to discover memecoins. Execute trades in milliseconds with zero third-party aggregator bloat and native on-chain fee routing.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={onLaunchClick}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm font-semibold px-8 py-3.5 rounded-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30">
                LAUNCH TERMINAL <ArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full sm:w-auto border border-blue-900/60 bg-blue-950/20 hover:bg-blue-900/30 text-blue-300 font-mono text-sm font-semibold px-8 py-3.5 rounded-sm backdrop-blur transition-all">
                VIEW DOCS
              </button>
            </div>
          </div>
        </Velaris>
      </section>

      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mb-3">BUILT FOR MAXIMUM VELOCITY</h2>
          <p className="text-zinc-400 text-sm font-mono">Engineered from the ground up for seamless institutional execution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-xl bg-zinc-900/50 border border-blue-950/50 backdrop-blur hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white mb-2">Zero-Aggregator Routing</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Bypasses third-party routers entirely. Custom Anchor programs execute swaps directly with atomic efficiency.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-zinc-900/50 border border-blue-950/50 backdrop-blur hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white mb-2">Embedded Session Wallets</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Log in instantly with Google or Apple. Zero friction onboarding paired with support for Phantom & MetaMask.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-zinc-900/50 border border-blue-950/50 backdrop-blur hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white mb-2">Multi-Sig Treasury Vault</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              1% protocol fees route directly and atomically on-chain into secure, institutional-grade Squads vaults.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-blue-950/40 py-8 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© 2026 CRYINDER TERMINAL. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-blue-400 transition-colors">X (TWITTER)</a>
            <a href="#" className="hover:text-blue-400 transition-colors">TELEGRAM</a>
            <a href="#" className="hover:text-blue-400 transition-colors">DOCS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
