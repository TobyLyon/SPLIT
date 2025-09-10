-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Squad metadata table
create table public.squad_metadata (
    id uuid default uuid_generate_v4() primary key,
    pubkey text unique not null,
    name text not null,
    slug text unique not null,
    description text,
    banner_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User profiles table
create table public.user_profiles (
    id uuid default uuid_generate_v4() primary key,
    wallet_address text unique not null,
    twitter_handle text unique,
    twitter_profile_url text,
    twitter_verified boolean default false,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity scores table
create table public.activity_scores (
    id uuid default uuid_generate_v4() primary key,
    wallet_address text not null,
    squad_pubkey text,
    score integer not null default 0 check (score >= 0 and score <= 100),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(wallet_address, squad_pubkey)
);

-- Leaderboard table (precomputed for performance)
create table public.leaderboard (
    id uuid default uuid_generate_v4() primary key,
    type text not null check (type in ('squad', 'member')),
    pubkey text not null,
    name text not null,
    total_staked bigint not null default 0,
    member_count integer,
    twitter_handle text,
    rank integer not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(type, pubkey)
);

-- Twitter proof attempts table
create table public.twitter_proofs (
    id uuid default uuid_generate_v4() primary key,
    wallet_address text not null,
    nonce text not null,
    tweet_url text,
    verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null
);

-- Oracle activity updates log
create table public.oracle_updates (
    id uuid default uuid_generate_v4() primary key,
    wallet_address text not null,
    squad_pubkey text,
    old_score integer,
    new_score integer not null,
    signature text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_squad_metadata_pubkey on public.squad_metadata(pubkey);
create index idx_squad_metadata_slug on public.squad_metadata(slug);
create index idx_user_profiles_wallet on public.user_profiles(wallet_address);
create index idx_user_profiles_twitter on public.user_profiles(twitter_handle);
create index idx_activity_scores_wallet on public.activity_scores(wallet_address);
create index idx_activity_scores_squad on public.activity_scores(squad_pubkey);
create index idx_leaderboard_type_rank on public.leaderboard(type, rank);
create index idx_twitter_proofs_wallet on public.twitter_proofs(wallet_address);
create index idx_twitter_proofs_nonce on public.twitter_proofs(nonce);

-- Row Level Security (RLS) policies
alter table public.squad_metadata enable row level security;
alter table public.user_profiles enable row level security;
alter table public.activity_scores enable row level security;
alter table public.leaderboard enable row level security;
alter table public.twitter_proofs enable row level security;
alter table public.oracle_updates enable row level security;

-- Public read access for most tables
create policy "Public read access" on public.squad_metadata for select using (true);
create policy "Public read access" on public.user_profiles for select using (true);
create policy "Public read access" on public.activity_scores for select using (true);
create policy "Public read access" on public.leaderboard for select using (true);

-- Users can insert/update their own profiles
create policy "Users can manage own profile" on public.user_profiles 
    for all using (auth.uid()::text = wallet_address);

-- Users can view their own twitter proofs
create policy "Users can manage own twitter proofs" on public.twitter_proofs 
    for all using (auth.uid()::text = wallet_address);

-- Only service role can update activity scores and oracle logs
create policy "Service role only" on public.activity_scores for all using (auth.role() = 'service_role');
create policy "Service role only" on public.oracle_updates for all using (auth.role() = 'service_role');

-- Functions for updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.squad_metadata
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.activity_scores
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.leaderboard
    for each row execute procedure public.handle_updated_at();

-- Function to update leaderboard rankings
create or replace function public.update_leaderboard_rankings()
returns void as $$
begin
    -- Update squad rankings
    with ranked_squads as (
        select 
            pubkey,
            name,
            total_staked,
            member_count,
            row_number() over (order by total_staked desc, member_count desc) as new_rank
        from public.leaderboard
        where type = 'squad'
    )
    update public.leaderboard
    set rank = rs.new_rank,
        updated_at = timezone('utc'::text, now())
    from ranked_squads rs
    where public.leaderboard.pubkey = rs.pubkey
    and public.leaderboard.type = 'squad';

    -- Update member rankings
    with ranked_members as (
        select 
            pubkey,
            name,
            total_staked,
            twitter_handle,
            row_number() over (order by total_staked desc) as new_rank
        from public.leaderboard
        where type = 'member'
    )
    update public.leaderboard
    set rank = rs.new_rank,
        updated_at = timezone('utc'::text, now())
    from ranked_members rs
    where public.leaderboard.pubkey = rs.pubkey
    and public.leaderboard.type = 'member';
end;
$$ language plpgsql;

-- Storage buckets for file uploads
insert into storage.buckets (id, name, public) values ('squad-banners', 'squad-banners', true);
insert into storage.buckets (id, name, public) values ('user-avatars', 'user-avatars', true);

-- Storage policies
create policy "Public read access" on storage.objects for select using (bucket_id in ('squad-banners', 'user-avatars'));
create policy "Authenticated upload" on storage.objects for insert with check (auth.role() = 'authenticated');
create policy "Users can update own files" on storage.objects for update using (auth.uid()::text = owner);
create policy "Users can delete own files" on storage.objects for delete using (auth.uid()::text = owner);