-- ════════════════════════════════════════════════════════════
-- Migration: Create blog_posts table
-- ════════════════════════════════════════════════════════════

create table if not exists blog_posts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  date        text not null default to_char(now(), 'Month DD, YYYY'),
  category    text not null default 'General',
  image_url   text,
  excerpt     text,
  sections    jsonb not null default '[]'::jsonb,
  is_visible  boolean not null default true,
  priority    int not null default 0,
  created_at  timestamptz not null default now()
);

-- Index for fast slug lookups (public detail page)
create unique index if not exists blog_posts_slug_idx on blog_posts (slug);

-- Index for listing page ordering
create index if not exists blog_posts_priority_idx on blog_posts (priority asc);

-- ── RLS ──────────────────────────────────────────────────────
alter table blog_posts enable row level security;

-- Public: anyone can read visible posts
create policy "Public can read visible blog posts"
  on blog_posts for select
  using (is_visible = true);

-- Admin: full access (service_role bypasses RLS automatically,
--        but add for authenticated admin users too)
create policy "Authenticated users have full access"
  on blog_posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Storage bucket for blog cover images ─────────────────────
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Allow public reads from bucket
create policy "Blog images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Allow authenticated users to upload
create policy "Authenticated users can upload blog images"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and auth.role() = 'authenticated');

-- Allow authenticated users to delete
create policy "Authenticated users can delete blog images"
  on storage.objects for delete
  using (bucket_id = 'blog-images' and auth.role() = 'authenticated');
