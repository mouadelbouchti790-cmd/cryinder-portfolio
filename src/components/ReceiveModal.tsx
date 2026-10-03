import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, QrCode } from 'lucide-react';

interface ReceiveModalProps {
  walletAddress: string;
  onClose: () => void;
}

export default function ReceiveModal({ walletAddress, onClose }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard denied */
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=F8FAFC&bgcolor=0A1326&data=${encodeURIComponent(walletAddress)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Receive tokens"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-sheet w-full max-w-[400px] rounded-[4px] p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
            <QrCode className="h-4 w-4 text-[#E2E8F0]" />
            Receive
          </h3>
          <button onClick={onClose} aria-label="Close" className="rounded-[3px] p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center rounded-[3px] border border-white/[0.08] bg-[#010409] px-4 py-5">
          <img src={qrUrl} alt="Wallet QR code" width={180} height={180} className="h-[180px] w-[180px rounded-[3px]" draggable={false} />
          <p className="tnum mt-4 break-all text-center font-mono text-xs font-semibold text-[#CBD5E1]">
            {walletAddress}
          </p>
          <button
            onClick={handleCopy}
            className={`mt-3 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[3px] px-4 text-[13px] font-extrabold transition-all ${
              copied ? 'bg-[#10B981]/15 text-[#10B981]' : 'chrome-btn'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-[#8A9AB2]">
          Send only Solana and SPL tokens to this address. Other networks will lose funds.
        </p>
      </motion.div>
    </motion.div>
  );
}
