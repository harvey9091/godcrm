-- Create tweets table
create table tweets (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  author_name text,
  author_handle text,
  avatar_url text,
  content text,
  created_at_posted timestamp with time zone,
  fetched_at timestamp with time zone default now(),
  likes integer default 0,
  retweets integer default 0,
  replies integer default 0,
  media_urls text[] default '{}',
  tags text[] default '{}',
  fetch_status text default 'pending',
  analysis_json jsonb,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_tweets_created_by on tweets(created_by);
create index idx_tweets_created_at on tweets(created_at);
create index idx_tweets_fetch_status on tweets(fetch_status);

-- Enable RLS
alter table tweets enable row level security;

-- Create policies
create policy "Users can view their own tweets" on tweets
  for select using (created_by = auth.uid());

create policy "Users can insert their own tweets" on tweets
  for insert with check (created_by = auth.uid());

create policy "Users can update their own tweets" on tweets
  for update using (created_by = auth.uid());

create policy "Users can delete their own tweets" on tweets
  for delete using (created_by = auth.uid());

-- Set up triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tweets_updated_at 
  before update on tweets 
  for each row 
  execute function update_updated_at_column();