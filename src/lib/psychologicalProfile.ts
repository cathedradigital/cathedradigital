/**
 * Personal psychological profiling is intentionally disabled.
 *
 * The current Supabase schema does not provision the user_emotions or
 * user_psychological_profiles tables, and there is no explicit user opt-in
 * flow for inferring emotions from private spiritual notes/reflections.
 * Do not transmit or persist this sensitive content until both consent and
 * schema/RLS controls are implemented and verified.
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
