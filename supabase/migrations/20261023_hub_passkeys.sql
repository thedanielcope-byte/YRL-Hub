-- Face ID / Touch ID sign-in for the agent hub (WebAuthn passkeys).
-- Kept separate from Nomad OS's webauthn_* tables so a hub passkey can never unlock Nomad OS (or the reverse).
-- Service role only: the hub-passkey edge function is the only reader/writer.
create table if not exists public.hub_webauthn_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  transports text[] not null default '{}',
  rp_id text not null,
  label text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists hub_webauthn_credentials_user_idx on public.hub_webauthn_credentials(user_id);

create table if not exists public.hub_webauthn_challenges (
  challenge text primary key,
  purpose text not null check (purpose in ('register','login')),
  user_id uuid,
  rp_id text not null,
  expires_at timestamptz not null default now() + interval '5 minutes'
);

alter table public.hub_webauthn_credentials enable row level security;
alter table public.hub_webauthn_challenges enable row level security;
revoke all on public.hub_webauthn_credentials from anon, authenticated;
revoke all on public.hub_webauthn_challenges from anon, authenticated;
