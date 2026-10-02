import React from 'react';
import { Icons } from '@/constants';
import { motion } from 'framer-motion';

interface Props {
  text: string;
}

export const SaintMeditationBlock: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="my-spacing-lg p-spacing-lg rounded-xl bg-primary/[0.02] border border-primary/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-spacing-md opacity-20 group-hover:opacity-40 transition-opacity">
        <Icons.Mountain className="w-8 h-8 text-primary" />
      </div>
      
      <header className="mb-spacing-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
          Meditação Guiada
        </span>
        <h4 className="font-serif text-premium-lg text-primary mt-1">
          Momento de Silêncio
        </h4>
      </header>

      <div className="cathedra-reader-article prose-premium italic text-foreground/80 leading-[1.72] font-serif">
        {text}
      </div>
    </motion.section>
  );
};
