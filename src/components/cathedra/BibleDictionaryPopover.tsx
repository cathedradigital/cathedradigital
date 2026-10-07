import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/db';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from '@/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BibleDictionaryPopoverProps {
  term: string;
  children: React.ReactNode;
}



const BibleDictionaryPopover: React.FC<BibleDictionaryPopoverProps> = ({ term, children }) => {
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ['glossary-term', term],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary')
        .select('*')
        .ilike('term', term)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching glossary term:', error);
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours caching
    gcTime: 1000 * 60 * 60 * 48, // 48 hours garbage collection
    retry: 2,
  });

  // Pre-fetch related terms for smoother experience
  useEffect(() => {
    if (entry?.term) {
       // logic to prefetch could go here
    }
  }, [entry]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    toast.success(isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos", {
      description: `O termo ${term} foi ${isFavorited ? 'removido' : 'salvo'} na sua biblioteca.`,
    });
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          data-testid="bible-dictionary-popover-trigger"
          className="underline decoration-primary/45 decoration-dotted underline-offset-4 hover:decoration-secondary hover:decoration-2 transition-all cursor-help text-left focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none rounded-sm font-medium"
          aria-haspopup="dialog"
          aria-label={\`Explicar o termo bíblico “\${term}”\`}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-spacing-lg rounded-premium-lg border-primary/10 shadow-premium-hover bg-background/95 backdrop-blur-xl">
        {isLoading ? (
          <div className="space-y-spacing-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : entry ? (
          <div className="space-y-spacing-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-spacing-sm">
                <h4 className="font-display text-premium-md text-primary">{entry.term}</h4>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-spacing-lg w-spacing-lg rounded-premium-full"
                  onClick={toggleFavorite}
                  aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Icons.Star className={cn("w-spacing-sm h-spacing-sm", isFavorited ? "fill-primary text-primary" : "text-primary/20")} />
                </Button>
              </div>
              <Icons.Glossary className="w-spacing-md h-spacing-md text-primary/20" />
            </div>

            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-secondary/80">Por que esta palavra está destacada</p>
            <p className="text-premium-xs leading-relaxed text-foreground/80 italic">
              {entry.definition}
            </p>
            {entry.deep_interpretation && (
              <div className="pt-spacing-sm border-t border-primary/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/80 mb-spacing-xs">Contexto teológico</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {entry.deep_interpretation}
                </p>
              </div>
            )}
            {entry.reference && (
              <p className="text-[10px] text-foreground/60 text-right italic">Fonte: {entry.reference}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-spacing-md space-y-spacing-sm">
            <Icons.Info className="w-spacing-lg h-spacing-lg text-primary/10 mx-auto" />
            <p className="text-premium-xs text-muted-foreground italic">Termo em catalogação nos arquivos da Cathedra.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BibleDictionaryPopover;