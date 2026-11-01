import { JourneyService } from '@/core/journey';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db';

export interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  totalVisits: number;
  totalDownloads: number;
  totalRevenue: number;
  pendingRevenue: number;
  pwaInstalls: number;
  pwaOpens: number;
  activeToday: number;
  activeLast30Days: number;
  inactiveUsers: number;
  journeysInProgress: number;
  totalReflections: number;
  totalJourneysStarted: number;
  totalJourneysCompleted: number;
  returnRate: number;
  recentTransactions: any[];
  userGrowth: { name: string; total: number }[];
  revenueData: { name: string; amount: number }[];
  diocesesStats: { name: string; count: number }[];
  statesStats: { name: string; count: number }[];
  movementsStats: { name: string; count: number }[];
  users: AdminUser[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  is_premium: boolean;
  created_at: string;
  xp: number | null;
  level: number | null;
  streak: number | null;
  last_visit: string | null;
  reflections_count?: number;
  depth_level?: string;
  current_journey?: string;
  access_frequency?: string;
}

export const useAdminDashboardData = (page = 0, pageSize = 20) => {
  return useQuery({
    queryKey: ['admin-dashboard-stats', page, pageSize],
    queryFn: async (): Promise<AdminStats> => {
      const now = new Date();
      const thirtyDaysAgoStart = new Date(now);
      thirtyDaysAgoStart.setDate(now.getDate() - 30);
      const iso30 = thirtyDaysAgoStart.toISOString();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const inactiveCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

      const from = page * pageSize;
      const to = from + pageSize - 1;
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const currentMonth = now.getMonth();

      // Indicadores globais usam COUNT exato no banco; não derivar totais
      // da página de 20 usuários exibida na tabela administrativa.
      const growthPromise = Promise.all(
        months.slice(0, currentMonth + 1).map(async (month, index) => {
          const monthEnd = new Date(now.getFullYear(), index + 1, 1);
          const { count, error } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .lt('created_at', monthEnd.toISOString());
          if (error) throw error;
          return { name: month, total: count || 0 };
        })
      );

      const [
        statsRes,
        profilesRes,
        premiumRes,
        activeTodayRes,
        activeLast30Res,
        inactiveRes,
        visitsRes,
        downloadsRes,
        installsRes,
        opensRes,
        transactionsRes,
        journalRes,
        journeysStartedRes,
        crmRes,
        userGrowth,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id, is_premium, created_at, last_visit, diocese, estado, movimento_pastoral, name, role, xp, level, streak').range(from, to),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_visit', todayStart.toISOString()),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('last_visit', iso30),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).or(`last_visit.is.null,last_visit.lt.${inactiveCutoff.toISOString()}`),
        supabase.from('app_metrics').select('id', { count: 'exact', head: true }).eq('metric_type', 'visit').gte('created_at', iso30),
        supabase.from('app_metrics').select('id', { count: 'exact', head: true }).eq('metric_type', 'download').gte('created_at', iso30),
        supabase.from('app_metrics').select('id', { count: 'exact', head: true }).eq('metric_type', 'pwa_install').gte('created_at', iso30),
        supabase.from('app_metrics').select('id', { count: 'exact', head: true }).eq('metric_type', 'pwa_open').gte('created_at', iso30),
        supabase.from('transactions').select('amount, status, created_at, profiles(name)').order('created_at', { ascending: false }).limit(100),
        supabase.from('spiritual_journal').select('user_id', { count: 'exact', head: true }),
        JourneyService.getGlobalProgressCounts(),
        supabase.from('user_management_stats').select('id, email, classification, reflections_count, current_journey, last_activity').range(from, to),
        growthPromise,
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (premiumRes.error) throw premiumRes.error;
      if (activeTodayRes.error) throw activeTodayRes.error;
      if (activeLast30Res.error) throw activeLast30Res.error;
      if (inactiveRes.error) throw inactiveRes.error;
      if (visitsRes.error) throw visitsRes.error;
      if (downloadsRes.error) throw downloadsRes.error;
      if (installsRes.error) throw installsRes.error;
      if (opensRes.error) throw opensRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (journeysStartedRes.error) throw journeysStartedRes.error;

      const profiles = profilesRes.data || [];
      const transactions = transactionsRes.data || [];
      const totalCount = statsRes.count || 0;

      // Receita e agregações geográficas ainda dependem de consolidação no banco;
      // não são apresentadas como contagens globais derivadas desta página.
      const totalRevenue = transactions.filter(t => t.status === 'approved').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const pendingRevenue = transactions.filter(t => t.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0);

      const premiumCount = premiumRes.count || 0;
      const visitsCount = visitsRes.count || 0;
      const downloadsCount = downloadsRes.count || 0;
      const pwaInstalls = installsRes.count || 0;
      const pwaOpens = opensRes.count || 0;
      const activeToday = activeTodayRes.count || 0;
      const activeLast30Days = activeLast30Res.count || 0;
      const inactiveUsers = inactiveRes.count || 0;
      const returnRate = totalCount > 0 ? ((totalCount - inactiveUsers) / totalCount) * 100 : 0;

      const dioceseMap = new Map<string, number>();
      const stateMap = new Map<string, number>();
      const movementMap = new Map<string, number>();

      profiles.forEach(p => {
        if (p.diocese) dioceseMap.set(p.diocese, (dioceseMap.get(p.diocese) || 0) + 1);
        if (p.estado) stateMap.set(p.estado, (stateMap.get(p.estado) || 0) + 1);
        if (p.movimento_pastoral) movementMap.set(p.movimento_pastoral, (movementMap.get(p.movimento_pastoral) || 0) + 1);
      });

      return {
        totalUsers: totalCount,
        premiumUsers: premiumCount,
        totalVisits: visitsCount,
        totalDownloads: downloadsCount,
        pwaInstalls,
        pwaOpens,
        activeToday,
        activeLast30Days,
        inactiveUsers,
        journeysInProgress: journeysStartedRes.data?.started || 0,
        totalReflections: journalRes.count || 0,
        totalJourneysStarted: journeysStartedRes.data?.started || 0,
        totalJourneysCompleted: journeysStartedRes.data?.completed || 0,
        returnRate,
        totalRevenue,
        pendingRevenue,
        recentTransactions: transactions.slice(0, 10),
        userGrowth,
        revenueData,
        diocesesStats: Array.from(dioceseMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        statesStats: Array.from(stateMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        movementsStats: Array.from(movementMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        users: profiles.map(p => {
          const crm = ((crmRes.data || []) as any[]).find(u => u.id === p.id) || {};
          return {
            ...p,
            email: crm.email || '',
            depth_level: crm.classification || 'Novo',
            reflections_count: crm.reflections_count || 0,
            current_journey: crm.current_journey || 'Nenhuma',
            last_visit: crm.last_activity || p.last_visit,
            name: (p as any).name || 'Usuário'
          } as AdminUser;
        })
      };
    },
    refetchInterval: 60000,
  });
};
