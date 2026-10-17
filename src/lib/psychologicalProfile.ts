/**
 * Personal psychological profiling is intentionally disabled.
 *
 * The connected Supabase project contains user_emotions and
 * user_psychological_profiles tables, but repository inspection found no
 * explicit user opt-in flow for inferring emotions from private spiritual
 * notes/reflections. Keep profiling disabled until informed consent, purpose
 * limitation, retention/deletion controls, and the existing RLS policies have
 * been reviewed and tested together.
 */

export interface EmotionRecord {
  emotion_type: string;
  score: number;
  context_text?: string;
  source_feature: string;
}

export interface PsychologicalProfile {
  dominant_emotion?: string;
  mood_history: string[];
  traits: Record<string, any>;
  last_updated: string;
}

/**
 * Compatibility no-op. Callers may keep invoking this until an explicit
 * opt-in workflow is implemented; the user's note/reflection is not sent to
 * any profiling endpoint and no inferred profile is persisted.
 */
export async function saveUserPsychology(
  _userId: string,
  _text: string,
  _source: string
): Promise<void> {
  return;
}

/** Profiling remains unavailable until the consent and storage gates exist. */
export async function getUserPsychology(_userId: string): Promise<PsychologicalProfile | null> {
  return null;
}
