-- Concede acesso administrativo às contas proprietárias já existentes.
-- A senha nunca é armazenada em migrações, código ou logs.
insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users as u
where lower(u.email) in ('cathedradigital@gmail.com', 'evaldo0510@gmail.com')
on conflict (user_id, role) do nothing;
