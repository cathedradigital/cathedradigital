import { Icons } from '@/constants';
import { GraduationCap } from 'lucide-react';

export interface ShelfItem {
  label: string;
  to: string;
  icon: any;
  desc: string;
  count?: string;
  badge?: string;
}

export interface LibraryShelf {
  id: string;
  title: string;
  icon: any;
  items: ShelfItem[];
}

export const MONASTERY_SHELVES: LibraryShelf[] = [
  {
    id: 'formation',
    title: 'FORMAÇÃO',
    icon: Icons.Bible,
    items: [
      { label: 'Bíblia', to: '/bible', icon: Icons.Bible, desc: 'Escrituras' },
      { label: 'Catecismo', to: '/catechism', icon: Icons.Catechism, desc: 'Doutrina' },
      { label: 'Glossário', to: '/glossary', icon: Icons.Glossary, desc: 'Termos' },
      { label: 'Temas', to: '/buscar?q=temas', icon: Icons.Search, desc: 'Estudos' },
    ]
  },
  {
    id: 'spirituality',
    title: 'ESPIRITUALIDADE',
    icon: Icons.Prayer,
    items: [
      { label: 'Santos', to: '/saints', icon: Icons.Saints, desc: 'Capelas' },
      { label: 'Aparições', to: '/aparicoes', icon: Icons.Star, desc: 'Maria' },
      { label: 'Orações', to: '/oracao', icon: Icons.Prayer, desc: 'Devocionário' },
      { label: 'Liturgia', to: '/liturgia', icon: Icons.DailyLiturgy, desc: 'Calendário' },
    ]
  },
  {
    id: 'church',
    title: 'IGREJA',
    icon: Icons.Church,
    items: [
      { label: 'Patrística', to: '/biblioteca?filter=patristica', icon: Icons.Library, desc: 'Padres' },
      { label: 'Magistério', to: '/magisterium', icon: Icons.Magisterium, desc: 'Documentos' },
      { label: 'Papas', to: '/papas', icon: Icons.User, desc: 'Sucessores' },
      { label: 'Dogmas', to: '/dogmas', icon: Icons.Shield, desc: 'Verdades' },
      { label: 'Doutores', to: '/doutores', icon: GraduationCap, desc: 'Mestres' },
      { label: 'História', to: '/timeline', icon: Icons.Clock, desc: 'Linha do Tempo' },
      { label: 'Atlas', to: '/atlas', icon: Icons.Globe, desc: 'Geografia' },
    ]
  }
];

import { GraduationCap } from 'lucide-react';
