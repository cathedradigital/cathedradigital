import { supabase } from '@/lib/db';
import { toast } from "sonner";

export type AIFallbackReason = 'credits_exhausted' | 'rate_limited' | 'daily_limit' | 'auth' | 'network' | 'unavailable';

export interface AIResponse {
  content?: string;
  error?: string;
  limit_reached?: boolean;
  fallback_reason?: AIFallbackReason;
}

function notifyAIStatus(type: 'credits_exhausted' | 'rate_limited', message?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ai-status-error', { detail: { type, message } }));
}

function classifyAIError(error: unknown): AIFallbackReason {
  const message = String((error as any)?.message || error || '').toLowerCase();
  if (message.includes('429') || message.includes('rate')) return 'rate_limited';
  if (message.includes('credit') || message.includes('quota')) return 'credits_exhausted';
  if (message.includes('daily')) return 'daily_limit';
  if (message.includes('401') || message.includes('403') || message.includes('auth')) return 'auth';
  if (message.includes('network') || message.includes('fetch')) return 'network';
  return 'unavailable';
}

/**
 * Single frontend gateway for AI.
 * Secrets remain server-side: the browser only invokes the Supabase Edge Function.
 */
export const callColloquium = async (
  messages: { role: string; content: string }[],
  mode?: string | null,
  onStream?: (content: string) => void
): Promise<AIResponse> => {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim();
  if (!lastUser) return { error: 'Digite uma pergunta antes de enviar.' };

  try {
    const { data, error } = await supabase.functions.invoke('logos-ai', {
      body: {
        query: lastUser,
        context: mode || 'global',
        history: messages.slice(-5),
      },
    });

    if (error) throw error;

    const content = typeof data?.text === 'string'
      ? data.text
      : typeof data?.content === 'string'
        ? data.content
        : '';

    if (!content) {
      return { error: 'O serviço Logos IA respondeu sem conteúdo.', fallback_reason: 'unavailable' };
    }

    onStream?.(content);
    return { content };
  } catch (error) {
    const fallback_reason = classifyAIError(error);
    if (fallback_reason === 'rate_limited') notifyAIStatus('rate_limited', 'Logos IA temporariamente limitada.');
    if (fallback_reason === 'credits_exhausted') notifyAIStatus('credits_exhausted', 'Limite do serviço de IA atingido.');
    console.error('Logos IA gateway error:', error);
    return {
      error: 'Não foi possível conectar à Logos IA agora.',
      fallback_reason,
      limit_reached: fallback_reason === 'daily_limit' || fallback_reason === 'credits_exhausted',
    };
  }
};

export const getSpiritualInsight = async (
  query?: string,
  tag?: string,
  profileId?: string | null
): Promise<AIResponse> => {
  if (!query?.trim()) return { error: 'Pergunta vazia.' };
  return callColloquium(
    [{ role: 'user', content: query.trim() }],
    tag || 'global'
  );
};
