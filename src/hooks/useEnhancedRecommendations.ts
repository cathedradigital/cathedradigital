import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/db';
import { useAuth } from '@/hooks/useAuth';
import { JourneyService } from '@/core/journey';

export function useEnhancedRecommendations() {
  const { user, profile, userLevel } = useAuth();

  return useQuery({
    queryKey: ['enhanced-recommendations', user?.id, userLevel],
    queryFn: async () => {
      if (!user) return {
        type: 'ritual',
        title: 'Ritual do Dia',
        subtitle: 'Prática Espiritual',
        description: 'Mantenha sua constância diária no caminho de santidade.',
        route: '/hoje',
      };

      // 1. Fetch reading marks (recent activity)
      const { data: marks } = await supabase
        .from('reading_marks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);

      // 2. Fetch journal entries (emotional state/topics)
      const { data: journal } = await supabase
        .from('spiritual_journal')
        .select('mood, content')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false })
        .limit(1);

      // 3. Fetch active journey progress through the domain service.
      const latestJourneyProgress = await JourneyService.getLatestUserJourneyProgress(user.id);
      if (latestJourneyProgress.error) throw latestJourneyProgress.error;

      // Journey reads stay behind JourneyService; the UI never queries the
      // journeys/journey_steps/journey_progress tables directly.
      if (latestJourneyProgress.data?.journey_id) {
        const journeyResult = await JourneyService.getById(latestJourneyProgress.data.journey_id);
        if (journeyResult.error) throw journeyResult.error;
        const resumeResult = await JourneyService.resumeJourney(user.id, latestJourneyProgress.data.journey_id);
        if (resumeResult.error) throw resumeResult.error;
        const journey = journeyResult.data;
        const nextStep = resumeResult.data;
        if (journey) {
          return {
            type: 'journey',
            title: journey.title,
            subtitle: 'Continuar sua caminhada',
            description: `Você está progredindo bem. Próximo passo: ${nextStep?.title || 'Finalizar'}`,
            route: nextStep
              ? `/jornadas/${journey.id}/step?step=${encodeURIComponent(nextStep.id)}`
              : `/jornadas/${journey.id}`,
            metadata: { journey, nextStep, marks },
          };
        }
      }

      // Priority 2: Based on mood/journal
      if (journal?.[0]?.mood === 'struggle') {
        return {
          type: 'bible',
          title: 'Salmo de Confiança',
          subtitle: 'Conforto na tribulação',
          description: 'Leia o Salmo 23 e encontre descanso no Bom Pastor.',
          route: '/bible?book=Salmos&ch=23',
        };
      }

      // Priority 3: Based on level/profile
      const diagnosis = profile?._sensitive?.diagnosis_result as any;
      if (diagnosis?.goal === 'knowledge' || userLevel === 'iniciante') {
        return {
          type: 'catechism',
          title: 'Fundamentos da Fé',
          subtitle: 'O Símbolo dos Apóstolos',
          description: 'Aprofunde-se no que cremos através do Catecismo.',
          route: '/catechism?p=1',
        };
      }

      // Default
      return {
        type: 'ritual',
        title: 'Ritual do Dia',
        subtitle: 'Prática Espiritual',
        description: 'Mantenha sua constância diária no caminho de santidade.',
        route: '/hoje',
      };
    },
    enabled: true,
    staleTime: 1000 * 60 * 15,
  });
}