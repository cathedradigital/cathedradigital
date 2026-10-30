-- Version the index already present in the production schema.
-- The production migration history records version 20261023014133.
-- Additive and idempotent; no rows or access policies are changed.
create index if not exists idx_user_emotions_user_id
  on public.user_emotions (user_id);
