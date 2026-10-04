import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '@/constants';

const SplashScreen = React.forwardRef<HTMLDivElement, { onComplete: () => void }>(({ onComplete }, ref) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 0.45, delay: 1.75, ease: [0.4, 0, 0.2, 1] }}
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.72 }}
        animate={{ opacity: [0, 0.18, 0.08], scale: [0.72, 1.08, 1] }}
        transition={{ duration: 1.7, ease: 'easeOut' }}
        className="absolute w-[min(82vw,34rem)] aspect-square rounded-full"
        style={{ background: 'radial-gradient(circle, hsl(var(--secondary) / 0.35) 0%, transparent 70%)' }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, rotate: 0, scale: 0.84 }}
        animate={{ opacity: [0, 0.22, 0.08], rotate: 360, scale: 1 }}
        transition={{ opacity: { duration: 0.8 }, rotate: { duration: 2, ease: 'easeInOut' }, scale: { duration: 1.2, ease: 'easeOut' } }}
        className="absolute w-[clamp(10rem,48vw,18rem)] aspect-square rounded-full border border-primary/10"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0 18%, hsl(var(--primary) / 0.32) 22%, transparent 30% 48%, hsl(var(--primary) / 0.18) 54%, transparent 60% 100%)',
          boxShadow: '0 0 45px hsl(var(--primary) / 0.08)',
        }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.1, rotate: -360 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="absolute w-[clamp(8.5rem,42vw,15rem)] aspect-square rounded-full border border-primary/[0.08] border-dashed"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.72, rotateY: -90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex items-center justify-center"
        style={{ perspective: 800 }}
      >
        <div className="relative flex items-center justify-center w-[clamp(7.5rem,36vw,12rem)] h-[clamp(7.5rem,36vw,12rem)] rounded-full border border-primary/10 shadow-premium-hover bg-background/75 backdrop-blur-md">
          <Icons.Logo className="w-full h-full p-spacing-lg opacity-65" variant="dark" />
        </div>
      </motion.div>
      <div className="absolute bottom-[12%] w-[min(72vw,18rem)] h-[2px] bg-card/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.9, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-primary/10 rounded-full"
        />
      </div>
    </motion.div>
  );
});

SplashScreen.displayName = 'SplashScreen';

export default SplashScreen;
