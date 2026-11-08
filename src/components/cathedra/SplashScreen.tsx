import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Icons } from '@/constants';

const SplashScreen = React.forwardRef<HTMLDivElement, { onComplete: () => void }>(({ onComplete }, ref) => {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(onComplete, reduceMotion ? 650 : 1150);
    return () => window.clearTimeout(timer);
  }, [onComplete, reduceMotion]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, delay: reduceMotion ? 0.48 : 0.87, ease: [0.4, 0, 0.2, 1] }}
      role="status"
      aria-label="Abrindo a Cathedra Digital"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#102A3A]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 42%, rgba(212,175,55,0.13), transparent 34%), linear-gradient(145deg, #0B2230 0%, #102A3A 54%, #0A202D 100%)' }}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.2, 0.75, 0.25, 1] }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.42em] text-[#D4AF37]/75 sm:text-[10px]">
          Um espaço para a vida interior
        </p>
        <div className="relative flex h-[148px] w-[148px] items-center justify-center sm:h-[168px] sm:w-[168px]">
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-[#D4AF37]/25 border-dashed"
          />
          <motion.span
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-[9px] rounded-full border border-[#D4AF37]/35"
            style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
          />
          <div className="relative flex h-[124px] w-[124px] items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#0B2635] p-3 shadow-[0_0_0_7px_rgba(212,175,55,0.07),0_18px_55px_rgba(0,0,0,0.28)] sm:h-[142px] sm:w-[142px]">
            <span aria-hidden="true" className="absolute inset-[7px] rounded-full border border-[#D4AF37]/30" />
            <Icons.Logo className="relative h-full w-full p-3" variant="gold" />
          </div>
        </div>
        <div className="mt-5">
          <p className="font-display text-[clamp(1.8rem,5vw,2.7rem)] leading-none tracking-[0.035em] text-[#F8F5EE]">
            Cathedra Digital
          </p>
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#D4AF37]/90 sm:text-[10px]">
            Átrio · Estudar · Rezar · Formar-se
          </p>
        </div>
      </motion.div>
      <div aria-hidden="true" className="absolute bottom-[9%] h-px w-28 overflow-hidden bg-white/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: 'easeOut' }}
          className="h-full bg-[#D4AF37]/75"
        />
      </div>
    </motion.div>
  );
});

SplashScreen.displayName = 'SplashScreen';

export default SplashScreen;
