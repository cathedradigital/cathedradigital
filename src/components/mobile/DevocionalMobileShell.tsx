/**
 * DevocionalMobileShell — Etapa M9.
 *
 * Envelopa páginas devocionais (Rosário, Via Crucis, Missal, Breviário,
 * Ladainhas, Oração) com MobileTopBar + MobileBottomNav no mobile.
 * MobileTopBar e MobileBottomNav já se autolimitam a `md:hidden`, portanto
 * o layout desktop permanece intacto.
 *
 * Injeta também dois recursos opcionais via `DevotionalReaderContext`:
 *   - Botão de índice (abre `DevotionalIndexSheet` com seções da página).
 *   - Botão de favorito (usa `useDevotionalFavorites`, reaproveitando
 *     `bible_favorites` estendida).
 */

import React, { useState } from "react";
import { MobileTopBar } from "@/components/mobile/MobileTopBar";
import { List, Star } from "lucide-react";
import {
  DevotionalReaderProvider,
  useDevotionalReader,
} from "@/components/mobile/DevotionalReaderContext";
import { DevotionalIndexSheet } from "@/components/mobile/DevotionalIndexSheet";
import { useDevotionalFavorites } from "@/hooks/useDevotionalFavorites";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  kicker?: string;
  title: string;
  children: React.ReactNode;
}

function ShellChrome({ kicker, title, children }: Props) {
  const { indexTitle, indexItems, favorite } = useDevotionalReader();
  const { isFavorited, toggle } = useDevotionalFavorites();
  const [indexOpen, setIndexOpen] = useState(false);

  const hasIndex = indexItems.length > 0;
  const isFav = favorite ? isFavorited(favorite.contentType, favorite.contentId) : false;

  const handleFav = async () => {
    if (!favorite) return;
    try {
      await toggle(favorite);
      toast.success(isFav ? "Removido dos favoritos" : "Adicionado aos favoritos");
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg === "auth-required" ? "Faça login para favoritar" : "Erro ao salvar favorito");
    }
  };

  const actions = (
    <>
      {hasIndex && (
        <button
          type="button"
          aria-label="Abrir índice"
          onClick={() => setIndexOpen(true)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            "text-stitch-on-surface hover:bg-stitch-surface-container",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary",
          )}
        >
          <List className="h-5 w-5" />
        </button>
      )}
      {favorite && (
        <button
          type="button"
          aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          aria-pressed={isFav}
          onClick={handleFav}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary",
            isFav
              ? "text-stitch-secondary"
              : "text-stitch-on-surface hover:bg-stitch-surface-container",
          )}
        >
          <Star className={cn("h-5 w-5", isFav && "fill-current")} />
        </button>
      )}
    </>
  );

  return (
    <>
      <MobileTopBar kicker={kicker} title={title} showBack transparent actions={actions} />
      <div>{children}</div>
      {hasIndex && (
        <DevotionalIndexSheet
          open={indexOpen}
          onOpenChange={setIndexOpen}
          title={indexTitle ?? "Índice"}
          items={indexItems}
        />
      )}
    </>
  );
}

export function DevocionalMobileShell({ kicker = "Cathedra · Oração", title, children }: Props) {
  return (
    <DevotionalReaderProvider>
      <ShellChrome kicker={kicker} title={title}>
        {children}
      </ShellChrome>
    </DevotionalReaderProvider>
  );
}
