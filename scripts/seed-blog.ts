/**
 * Seed script — imports all hardcoded blog posts into Supabase.
 * Run once after the migration:
 *   npx ts-node --project tsconfig.json scripts/seed-blog.ts
 *
 * Or via tsx (recommended for Next.js projects):
 *   npx tsx scripts/seed-blog.ts
 */

import { createClient } from '@supabase/supabase-js'
import { blogPosts } from '../src/lib/data/blog-posts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // needs service role to bypass RLS
)

/** Convert a markdown-style content string into structured sections */
function parseSections(content: string): { question: string; answer: string }[] {
  // Split on lines that start with "## "
  const parts = content.split(/\n(?=## )/)
  const sections: { question: string; answer: string }[] = []

  for (const part of parts) {
    const lines = part.trim().split('\n')
    const firstLine = lines[0].trim()

    if (firstLine.startsWith('## ')) {
      const question = firstLine.replace(/^## /, '').trim()
      const answer = lines.slice(1).join('\n').trim()
      if (question) sections.push({ question, answer })
    } else {
      // Opening paragraph before first H2 — skip (it's part of excerpt)
    }
  }

  return sections
}

/** Slugify a title */
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function seed() {
  console.log(`\n🌱 Seeding ${blogPosts.length} blog posts into Supabase...\n`)

  for (const post of blogPosts) {
    const slug = toSlug(post.title)
    const sections = parseSections(post.content)

    const payload = {
      slug,
      title: post.title,
      date: post.date,
      category: post.category,
      image_url: post.image,
      excerpt: post.excerpt,
      sections,
      is_visible: true,
      priority: post.id - 1,  // preserve existing order
    }

    const { error } = await supabase
      .from('blog_posts')
      .upsert(payload, { onConflict: 'slug' })

    if (error) {
      console.error(`❌ Failed to seed post "${post.title}":`, error.message)
    } else {
      console.log(`✅ ${slug}`)
    }
  }

  console.log('\n✅ Seeding complete.\n')
}

seed().catch(console.error)
