import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/constants';

const SplashScreen = React.forwardRef<HTMLDivElement, { onComplete: () => void }>(({ onComplete }, ref) => {
  const [phase, setPhase] = useState<'motor' | 'logo' | 'text' | 'exit'>('motor');

  useEffect(() => {
    // The splash must never block the application. Keep the animated exit,
    // but also provide a browser-native CSS safety timeout in case the
    // animation/runtime is interrupted or React is unable to commit the
    // completion callback.
    // Sequência intencional: primeiro o "motor" de abertura; só depois a identidade textual.
    const t1 = setTimeout(() => setPhase('logo'), 2050);
    const t2 = setTimeout(() => setPhase('text'), 2200);
    const t3 = setTimeout(() => setPhase('exit'), 3050);
    const t4 = setTimeout(onComplete, 3650);
    const safety = setTimeout(onComplete, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(safety);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <>
        <style>{`
          @keyframes cathedra-splash-safety-exit {
            0%, 45% { opacity: 1; visibility: visible; }
            100% { opacity: 0; visibility: hidden; }
          }
        `}</style>
        <motion.div
          ref={ref}
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'exit' ? 0 : 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            animation: 'cathedra-splash-safety-exit 3.9s ease-out 3.3s forwards',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden transition-colors duration-1000"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: phase === 'motor' ? 0.15 : 0.08, scale: phase === 'motor' ? 1.5 : 1.2 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute w-[500px] h-[500px] rounded-premium-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--secondary) / 0.4) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: phase === 'motor' ? 0.08 : 0.04, rotate: 360 }}
            transition={{ opacity: { duration: 1 }, rotate: { duration: 30, repeat: Infinity, ease: 'linear' } }}
            className="absolute w-[600px] h-[600px]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, hsl(var(--secondary) / 0.15) 10%, transparent 20%, transparent 25%, hsl(var(--secondary) / 0.1) 35%, transparent 45%, transparent 50%, hsl(var(--secondary) / 0.12) 60%, transparent 70%, transparent 75%, hsl(var(--secondary) / 0.08) 85%, transparent 95%)`,
            }}
          />

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, x: (i % 2 === 0 ? -1 : 1) * (20 + i * 8) }}
              animate={{
                opacity: [0, 0.4, 0],
                y: [40, -60 - i * 10],
                x: (i % 2 === 0 ? -1 : 1) * (20 + i * 12),
              }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
              className="absolute w-spacing-2xs h-spacing-2xs rounded-premium-full bg-primary"
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex items-center justify-center"
            style={{ perspective: 800 }}
          >
            {/* Anel de inicialização: movimento contínuo e discreto, como um motor entrando em funcionamento. */}
            <motion.div
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 0, ease: 'easeInOut' }}
              className="absolute w-[clamp(9.5rem,48vw,15rem)] h-[clamp(9.5rem,48vw,15rem)] rounded-full border border-primary/10"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0 18%, hsl(var(--primary) / 0.32) 22%, transparent 30% 48%, hsl(var(--primary) / 0.18) 54%, transparent 60% 100%)',
                boxShadow: '0 0 45px hsl(var(--primary) / 0.08)',
              }}
            />
            <motion.div
              aria-hidden="true"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: 0, ease: 'easeInOut' }}
              className="absolute w-[clamp(8.5rem,42vw,13.5rem)] h-[clamp(8.5rem,42vw,13.5rem)] rounded-full border border-primary/[0.08] border-dashed"
            />
            <div className="relative flex items-center justify-center w-[clamp(7.5rem,36vw,12rem)] h-[clamp(7.5rem,36vw,12rem)] rounded-full border border-primary/10 shadow-premium-hover bg-background/75 backdrop-blur-md">
              <Icons.Logo className="w-full h-full p-spacing-lg opacity-65" variant="dark" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: phase === 'text' ? 1 : 0, y: phase === 'text' ? 0 : 16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative z-10 mt-spacing-xl text-center"
          >
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-premium-2xl md:text-premium-3xl font-display font-semibold text-primary uppercase tracking-[0.2em]"
            >
              Cathedra
            </motion.h1>
            <motion.h2 aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-[9px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-gold mt-spacing-sm"
            >
              Mosteiro Digital
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="text-[8px] md:text-[9px] uppercase tracking-[0.28em] text-muted-foreground mt-3"
            >
              Preparando o sistema
            </motion.p>
          </motion.div>

          <motion.div className="absolute bottom-spacing-2xl w-[min(72vw,18rem)] h-spacing-3xs bg-card/50 rounded-premium overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-primary/10 rounded-premium-full"
            />
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  );
});

SplashScreen.displayName = 'SplashScreen';

export default SplashScreen;
