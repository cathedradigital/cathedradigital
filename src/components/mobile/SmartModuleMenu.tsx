import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/rr-compat";
import { Icons } from "@/constants";
import { MODULE_NAVIGATION, type ModuleNavGroup } from "@/config/moduleNavigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const GROUP_ICONS: Record<string, typeof Icons.Circle> = {
  estudar: Icons.BookOpen,
  rezar: Icons.Prayer,
  "formar-se": Icons.Route,
  pesquisar: Icons.Search,
  "minha-jornada": Icons.Compass,
};

const ITEM_ICONS: Record<string, typeof Icons.Circle> = {
  bible: Icons.Bible,
  catechism: Icons.Catechism,
  documents: Icons.ScrollText,
  prayers: Icons.Prayer,
  liturgy: Icons.Liturgy,
  breviary: Icons.BookOpen,
  lectio: Icons.Lectio,
  rosary: Icons.Rosary,
  viacrucis: Icons.ViaCrucis,
  litanies: Icons.List,
  novenas: Icons.Calendar,
  missal: Icons.Church,
  examination: Icons.CheckCircle2,
  journeys: Icons.Journeys,
  themes: Icons.Themes,
  search: Icons.Search,
  nexus: Icons.Orbit,
  library: Icons.Library,
  saints: Icons.Saints,
  glossary: Icons.Glossary,
  atlas: Icons.Globe,
  aquinas: Icons.Aquinas,
  dogmas: Icons.Shield,
  popes: Icons.User,
  apparitions: Icons.Star,
  today: Icons.Home,
  journal: Icons.FileText,
  favorites: Icons.Heart,
  achievements: Icons.Trophy,
  profile: Icons.User,
  settings: Icons.Settings,
};

function findActiveGroup(pathname: string): ModuleNavGroup | undefined {
  return MODULE_NAVIGATION.find((group) =>
    group.items.some(
      (item) =>
        pathname === item.path ||
        (item.path !== "/" && pathname.startsWith(item.path + "/")),
    ),
  );
}

/**
 * Central Inteligente do Cathedra.
 *
 * Mobile-only: fica recolhida como um pequeno botão flutuante e abre uma
 * gaveta lateral com os ambientes e destinos canônicos.
 */
export function SmartModuleMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const activeGroup = useMemo(() => findActiveGroup(pathname), [pathname]);

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        type="button"
        data-testid="smart-module-menu-trigger"
        aria-label="Abrir módulos e ferramentas do Cathedra"
        aria-expanded={open}
        aria-controls="smart-module-menu"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed right-4 z-[120] md:hidden",
          "flex h-12 w-12 items-center justify-center rounded-full",
          "border border-stitch-outline-variant/70 bg-stitch-surface/95",
          "text-stitch-primary shadow-[0_8px_24px_rgba(15,23,42,0.14)] backdrop-blur-md",
          "transition-transform duration-200 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-stitch-background",
        )}
        style={{
          bottom:
            "calc(var(--stitch-mobile-bottomnav-h) + var(--stitch-mobile-safe-bottom) + 0.75rem)",
        }}
      >
        <Icons.LayoutGrid
          className="h-5 w-5"
          strokeWidth={2}
          aria-hidden="true"
        />
        {activeGroup && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-stitch-surface bg-stitch-secondary"
          />
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="smart-module-menu"
          side="right"
          className={cn(
            "w-[min(88vw,360px)] border-l border-stitch-outline-variant",
            "bg-stitch-surface p-0 text-stitch-on-surface",
          )}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "var(--stitch-mobile-safe-bottom)",
          }}
        >
          <SheetHeader className="border-b border-stitch-outline-variant/70 px-5 pb-4 pt-5 text-left">
            <SheetTitle className="font-[var(--font-stitch-display)] text-xl text-stitch-primary">
              Cátedra
            </SheetTitle>
            <SheetDescription className="text-sm text-stitch-on-surface-variant">
              Acesso rápido aos módulos e ferramentas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-3 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stitch-on-surface-variant">
              Módulos
            </div>

            <div className="space-y-2">
              {MODULE_NAVIGATION.map((group) => {
                const GroupIcon = GROUP_ICONS[group.key] ?? Icons.Circle;
                const isActive = activeGroup?.key === group.key;

                return (
                  <section
                    key={group.key}
                    aria-label={group.label}
                    className={cn(
                      "overflow-hidden rounded-2xl border",
                      isActive
                        ? "border-stitch-secondary/50 bg-stitch-secondary-container/30"
                        : "border-stitch-outline-variant/70 bg-stitch-surface-container/60",
                    )}
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: group.accentSoft,
                          color: group.accent,
                        }}
                      >
                        <GroupIcon
                          className="h-5 w-5"
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-stitch-on-surface">
                          {group.label}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-xs text-stitch-on-surface-variant">
                          {group.description}
                        </p>
                      </div>
                      {isActive && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-stitch-secondary">
                          Atual
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1 border-t border-stitch-outline-variant/50 p-2">
                      {group.items.map((item) => {
                        const ItemIcon = ITEM_ICONS[item.id] ?? Icons.Circle;
                        const itemActive =
                          pathname === item.path ||
                          (item.path !== "/" &&
                            pathname.startsWith(item.path + "/"));

                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-testid={"smart-module-" + item.id}
                            onClick={() => handleNavigate(item.path)}
                            aria-current={itemActive ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left",
                              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stitch-secondary",
                              itemActive
                                ? "bg-stitch-secondary-container text-stitch-secondary-on-container"
                                : "text-stitch-on-surface-variant hover:bg-stitch-surface-container-high",
                            )}
                          >
                            <ItemIcon
                              className="h-4 w-4 shrink-0"
                              strokeWidth={itemActive ? 2.1 : 1.7}
                              aria-hidden="true"
                            />
                            <span className="truncate text-xs font-medium">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
