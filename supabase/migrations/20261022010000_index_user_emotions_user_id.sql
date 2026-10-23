-- Covers the user_id foreign key to improve joins and parent-row delete/update checks.
-- Additive and idempotent; no rows or access policies are changed.
create index if not exists idx_user_emotions_user_id
  on public.user_emotions (user_id);
