-- Prevent self-service profile writes from granting PRO or administrative access.
-- RLS limits rows; this trigger protects privileged columns even when a caller
-- has UPDATE permission on their own profile row.

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  caller_is_admin boolean := false;
begin
  -- Trusted server-side writes and migration operations may have no user JWT.
  -- Anonymous browser requests remain blocked by RLS and have no write policy.
  if caller_id is null then
    return new;
  end if;

  caller_is_admin := public.has_role(caller_id, 'admin'::public.app_role);
  if caller_is_admin then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.id is distinct from caller_id then
      raise exception using
        errcode = '42501',
        message = 'A profile can only be created for the authenticated user.';
    end if;

    -- Never accept privileged billing/role claims from a client-created row.
    new.role := null;
    new.is_premium := false;
    new.premium_status := null;
    new.premium_expires_at := null;
    new.mercado_pago_subscription_id := null;
    new.email := coalesce(auth.jwt() ->> 'email', new.email, '');
    return new;
  end if;

  if new.role is distinct from old.role
     or new.is_premium is distinct from old.is_premium
     or new.premium_status is distinct from old.premium_status
     or new.premium_expires_at is distinct from old.premium_expires_at
     or new.mercado_pago_subscription_id is distinct from old.mercado_pago_subscription_id
     or new.email is distinct from old.email then
    raise exception using
      errcode = '42501',
      message = 'Privileged profile fields can only be changed by an administrator or trusted server.';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_privileged_fields() from public, anon, authenticated;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

-- profiles are private account records; anonymous/public table grants are unnecessary.
revoke all privileges on table public.profiles from anon, public;
