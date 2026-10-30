import { 
  Icons 
} from '@/constants';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: any;
  component?: string; // Nome para referência lazy load
  showInMenu: boolean;
  parentPath?: string;
  category?: 'core' | 'spiritual' | 'content' | 'user' | 'admin';
}

// Registro de metadados e compatibilidade de rotas.
// A navegação pública não é definida aqui: a fonte canônica é
// `src/config/moduleNavigation.ts`, organizada nos cinco ambientes.
// Aliases continuam registrados para compatibilidade/SEO.
export const APP_ROUTES: RouteConfig[] = [
  // Core Routes (Hub Spiritual)
  { path: '/bible', label: 'Bíblia', icon: Icons.Bible, showInMenu: true, category: 'core' },
  { path: '/rezar', label: 'Orar', icon: Icons.Prayer, showInMenu: true, category: 'core' },
  { path: '/igreja', label: 'Igreja', icon: Icons.Church, showInMenu: false, category: 'core' },
  { path: '/santos', label: 'Santos', icon: Icons.Saints, showInMenu: true, category: 'core' },
  { path: '/jornadas', label: 'Jornadas', icon: Icons.Journeys, showInMenu: true, category: 'core' },
  { path: '/nexus', label: 'Nexus', icon: Icons.Orbit, showInMenu: true, category: 'core' },
  { path: '/biblioteca', label: 'Biblioteca', icon: Icons.Search, showInMenu: true, category: 'core' },
  { path: '/profile', label: 'Perfil', icon: Icons.User, showInMenu: true, category: 'core' },

  // Secondary/Specific Routes
  { path: '/', label: 'Início', icon: Icons.Home, showInMenu: false, category: 'core' },
  { path: '/catechism', label: 'Catecismo', icon: Icons.Book, showInMenu: false, category: 'content' },
  { path: '/magisterium', label: 'Magistério', icon: Icons.ScrollText, showInMenu: false, category: 'content' },
  { path: '/atlas', label: 'Atlas Católico', icon: Icons.Globe, showInMenu: false, category: 'content' },
  // Rotas canônicas dos ambientes: metadados usados por breadcrumbs, não por menus.
  { path: '/liturgia', label: 'Liturgia', icon: Icons.Calendar, showInMenu: false, category: 'content' },
  { path: '/buscar', label: 'Buscar', icon: Icons.Search, showInMenu: false, category: 'content' },
  { path: '/acervo', label: 'Biblioteca', icon: Icons.BookOpen, showInMenu: false, category: 'content' },
  { path: '/hoje', label: 'Hoje', icon: Icons.Home, showInMenu: false, category: 'user' },


  // Content & Resources
  { path: '/oracao', label: 'Orações', icon: Icons.Prayer, showInMenu: true, category: 'content' },
  { path: '/oracao/rosario', label: 'Rosário', icon: Icons.Rosary, showInMenu: false, category: 'content', parentPath: '/oracao' },
  { path: '/oracao/exame-de-consciencia', label: 'Exame de consciência', icon: Icons.Heart, showInMenu: false, category: 'content', parentPath: '/oracao' },
  { path: '/rosary', label: 'Rosário', icon: Icons.Rosary, showInMenu: true, category: 'content' },
  { path: '/viacrucis', label: 'Via Sacra', icon: Icons.ViaCrucis, showInMenu: true, category: 'content' },
  { path: '/bible-recovery', label: 'Recovery Bíblia', icon: Icons.Stethoscope, showInMenu: false, category: 'content' },
  { path: '/glossario', label: 'Glossário', icon: Icons.Glossary, showInMenu: true, category: 'content' },

  // Órfãs catalogadas (rota real existe, showInMenu:false — decisão editorial futura)
  // ONDA 1: sair da condição de órfã sem promover ao menu.
  { path: '/temas', label: 'Temas', icon: Icons.Themes, showInMenu: false, category: 'content' },
  { path: '/aquinas', label: 'Aquinas', icon: Icons.Aquinas, showInMenu: false, category: 'content' },
  { path: '/papas', label: 'Papas', icon: Icons.User, showInMenu: false, category: 'content' },
  { path: '/aparicoes', label: 'Aparições', icon: Icons.Star, showInMenu: false, category: 'content' },
  { path: '/dogmas', label: 'Dogmas', icon: Icons.Shield, showInMenu: false, category: 'content' },
  { path: '/az-faith', label: 'A–Z da Fé', icon: Icons.AZ, showInMenu: false, category: 'content' },
  { path: '/lectio', label: 'Lectio Divina', icon: Icons.Lectio, showInMenu: false, category: 'content' },
  { path: '/confession', label: 'Confissão', icon: Icons.Heart, showInMenu: false, category: 'content' },
  { path: '/breviary', label: 'Breviário', icon: Icons.Book, showInMenu: false, category: 'content' },
  { path: '/missal', label: 'Missal', icon: Icons.Book, showInMenu: false, category: 'content' },
  { path: '/calendar', label: 'Calendário Litúrgico', icon: Icons.Calendar, showInMenu: false, category: 'content' },
  { path: '/litanies', label: 'Ladainhas', icon: Icons.Flame, showInMenu: false, category: 'content' },
  { path: '/novenas', label: 'Novenas', icon: Icons.Calendar, showInMenu: false, category: 'content' },

  { path: '/guia-modulos', label: 'Guia de Módulos', icon: Icons.BookOpen, showInMenu: false, category: 'content' },
  { path: '/community', label: 'Comunidade', icon: Icons.Users, showInMenu: false, category: 'user' },
  { path: '/diario', label: 'Diário Espiritual', icon: Icons.FileText, showInMenu: true, category: 'user' },
  { path: '/spiritual-profile', label: 'Perfil Espiritual', icon: Icons.User, showInMenu: false, category: 'user' },
  { path: '/onboarding', label: 'Boas-vindas', icon: Icons.Star, showInMenu: false, category: 'user' },

  // User Profile
  { path: '/favorites', label: 'Favoritos', icon: Icons.Heart, showInMenu: true, category: 'user' },
  { path: '/achievements', label: 'Conquistas', icon: Icons.Trophy, showInMenu: true, category: 'user' },
  { path: '/settings', label: 'Configurações', icon: Icons.Settings, showInMenu: true, category: 'user' },
  { path: '/about', label: 'Sobre', icon: Icons.Info, showInMenu: false, category: 'user' },
  { path: '/partners', label: 'Parceiros', icon: Icons.Users, showInMenu: false, category: 'user' },
  { path: '/privacy', label: 'Privacidade', icon: Icons.Shield, showInMenu: false, category: 'user' },
  { path: '/terms', label: 'Termos', icon: Icons.FileText, showInMenu: false, category: 'user' },
  { path: '/transparencia', label: 'Transparência', icon: Icons.Activity, showInMenu: false, category: 'user' },
  { path: '/design-system', label: 'Design System', icon: Icons.Palette, showInMenu: false, category: 'user' },


  // Admin
  { path: '/admin', label: 'Painel Admin', icon: Icons.Lock, showInMenu: false, category: 'admin' },
  { path: '/admin/audit', label: 'Dashboard de Auditoria', icon: Icons.Activity, showInMenu: false, category: 'admin' },
  { path: '/admin/telemetry', label: 'Telemetria', icon: Icons.Activity, showInMenu: false, category: 'admin' },
  { path: '/admin/security', label: 'Segurança', icon: Icons.Shield, showInMenu: false, category: 'admin' },
];

export const getRouteByPath = (path: string) => {
  // STAB-003D: preferir match exato antes de fallback por prefixo, evitando
  // que `/admin/audit` e `/magisterium/:id` retornem duas vezes o pai e gerem
  // chaves duplicadas no breadcrumb do AppHeader.
  return (
    APP_ROUTES.find(r => r.path === path) ||
    APP_ROUTES.find(r => r.path !== '/' && path.startsWith(r.path + '/')) ||
    APP_ROUTES.find(r => r.path !== '/' && path.startsWith(r.path))
  );
};

export const getBreadcrumbs = (path: string) => {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs: RouteConfig[] = [];
  const seen = new Set<string>();
  let currentPath = '';

  for (const part of parts) {
    currentPath += `/${part}`;
    const route = getRouteByPath(currentPath);
    // STAB-003D: deduplica por path para evitar chaves repetidas quando
    // um segmento filho (ex.: `/magisterium/dce`) não tem rota própria e
    // cai no pai (`/magisterium`).
    if (route && !seen.has(route.path)) {
      seen.add(route.path);
      breadcrumbs.push(route);
    }
  }

  return breadcrumbs;
};
