import { AppRoute } from './types';

/**
 * Compatibilidade para consumidores legados.
 *
 * A navegação pública canônica é MODULE_NAVIGATION em
 * src/config/moduleNavigation.ts. Este arquivo não deve criar uma segunda
 * arquitetura de menu nem promover rotas técnicas para a navegação pública.
 */
export const navigationConfig = {
  main: [
    { label: 'Início', route: AppRoute.HOME, icon: 'Home' },
    { label: 'Bíblia', route: AppRoute.BIBLE, icon: 'Bible' },
    { label: 'Catecismo', route: AppRoute.CATECHISM, icon: 'Catechism' },
  ],
  secondary: [
    { label: 'Hoje', route: AppRoute.HOJE, icon: 'Sun' },
    { label: 'Biblioteca', route: AppRoute.BIBLIOTECA, icon: 'Library' },
    { label: 'Santos', route: AppRoute.SAINTS, icon: 'Flame' },
    { label: 'Liturgia', route: AppRoute.LITURGIA, icon: 'Wine' },
  ],
  user: [
    { label: 'Perfil', route: AppRoute.PROFILE, icon: 'User' },
    { label: 'Diário', route: AppRoute.DIARIO, icon: 'BookOpen' },
    { label: 'Favoritos', route: AppRoute.FAVORITES, icon: 'Heart' },
    { label: 'Configurações', route: '/settings', icon: 'Settings' },
  ],
};
