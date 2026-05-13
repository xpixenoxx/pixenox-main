'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import {
  Eye, EyeOff, Edit, Trash2, Plus, X, GripVertical, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ── Types ─────────────────────────────────────────────────────
interface Section {
  question: string
  answer: string
}

interface BlogPost {
  id: string
  slug: string
  title: string
  date: string
  category: string
  image_url: string
  excerpt: string
  sections: Section[]
  is_visible: boolean
  priority: number
}

const CATEGORIES = ['AI & Technology', 'Web Development', 'Growth', 'Case Studies', 'Industry', 'General']

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

// ── Sortable Row ──────────────────────────────────────────────
function SortableRow({ post, onEdit, onDelete, onToggle }: {
  post: BlogPost
  onEdit: (p: BlogPost) => void
  onDelete: (id: string) => void
  onToggle: (id: string, val: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg ${isDragging ? 'shadow-2xl ring-2 ring-purple-500 bg-white/10' : ''}`}
    >
      <button {...attributes} {...listeners} className="p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Thumbnail */}
      <div className="w-16 h-12 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden border border-white/10">
        {post.image_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          : <span className="text-xs text-white/30">IMG</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold truncate text-white">{post.title}</h4>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-white/40">/blog/{post.slug}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">{post.category}</span>
          <span className="text-xs text-white/30">{post.sections.length} sections</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(post.id, !post.is_visible)}
          className={`p-2 rounded-lg transition-colors ${post.is_visible ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10'}`}
          title={post.is_visible ? 'Visible' : 'Hidden'}
        >
          {post.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(post)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(post.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Sections Editor ────────────────────────────────────────────
function SectionsEditor({ sections, onChange }: {
  sections: Section[]
  onChange: (s: Section[]) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})

  const add = () => onChange([...sections, { question: '', answer: '' }])
  const remove = (i: number) => onChange(sections.filter((_, idx) => idx !== i))
  const update = (i: number, field: 'question' | 'answer', val: string) => {
    const next = [...sections]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white/80">
          Sections <span className="text-white/40 font-normal">(Questions &amp; Answers)</span>
        </label>
        <button type="button" onClick={add} className="admin-button px-3 py-1.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="p-6 text-center text-white/30 border border-dashed border-white/10 rounded-xl text-sm">
          No sections yet. Click "Add Section" to add your first Q&amp;A block.
        </div>
      )}

      {sections.map((sec, i) => (
        <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
          {/* Section header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-white/70 truncate">
              {sec.question || <span className="text-white/30 italic">Untitled question</span>}
            </span>
            <button type="button" onClick={() => setCollapsed(c => ({ ...c, [i]: !c[i] }))} className="p-1 text-white/40 hover:text-white/70">
              {collapsed[i] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Section fields */}
          {!collapsed[i] && (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Question (renders as H2)</label>
                <input
                  className="admin-input font-semibold"
                  placeholder="e.g. The Judgment and Its Implications"
                  value={sec.question}
                  onChange={e => update(i, 'question', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Answer (paragraph under H2)</label>
                <textarea
                  className="admin-input min-h-[120px] resize-y leading-relaxed"
                  placeholder="Write the answer / description for this section..."
                  value={sec.answer}
                  onChange={e => update(i, 'answer', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Empty Post Template ───────────────────────────────────────
const emptyPost = (): Omit<BlogPost, 'id'> => ({
  slug: '',
  title: '',
  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
  category: 'General',
  image_url: '',
  excerpt: '',
  sections: [],
  is_visible: true,
  priority: 0,
})

// ── Main Page ─────────────────────────────────────────────────
export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loaded, setLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [draft, setDraft] = useState<any>(emptyPost())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()
  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('priority', { ascending: true })
    if (error) { toast(error.message, 'error'); return }
    setPosts(data ?? [])
    setLoaded(true)
  }

  // ── Drag reorder ────────────────────────────────────────────
  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setPosts(prev => {
      const oldIdx = prev.findIndex(p => p.id === active.id)
      const newIdx = prev.findIndex(p => p.id === over.id)
      const reordered = arrayMove(prev, oldIdx, newIdx)
      saveOrder(reordered)
      return reordered
    })
  }

  const saveOrder = async (ordered: BlogPost[]) => {
    const updates = ordered.map((p, i) => ({ ...p, priority: i }))
    const { error } = await supabase.from('blog_posts').upsert(updates)
    if (error) { toast('Reorder failed: ' + error.message, 'error'); fetchPosts() }
  }

  // ── Toggle visibility ───────────────────────────────────────
  const toggleVisibility = async (id: string, val: boolean) => {
    setPosts(posts.map(p => p.id === id ? { ...p, is_visible: val } : p))
    const { error } = await supabase.from('blog_posts').update({ is_visible: val }).eq('id', id)
    if (error) { toast('Update failed', 'error'); fetchPosts() }
  }

  // ── Delete ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return
    const { error } = await supabase.from('blog_posts').delete().eq('id', deleteId)
    if (error) { toast('Delete failed: ' + error.message, 'error'); return }
    setPosts(posts.filter(p => p.id !== deleteId))
    setDeleteId(null)
    toast('Post deleted', 'success')
  }

  // ── Open modals ─────────────────────────────────────────────
  const openCreate = () => {
    setDraft({ ...emptyPost(), priority: posts.length })
    setMode('create')
    setModalOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setDraft({ ...post })
    setMode('edit')
    setModalOpen(true)
  }

  // ── Save (create / update) ──────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = { ...draft }
      delete payload.id

      let res
      if (mode === 'create') {
        res = await supabase.from('blog_posts').insert([payload]).select().single()
      } else {
        res = await supabase.from('blog_posts').update(payload).eq('id', draft.id).select().single()
      }

      if (res.error) throw res.error
      toast(`Post ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
      setModalOpen(false)
      fetchPosts()
    } catch (err: any) {
      toast(err.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Auto-slug from title ────────────────────────────────────
  const handleTitleChange = (val: string) => {
    setDraft((d: any) => ({
      ...d,
      title: val,
      slug: mode === 'create' ? toSlug(val) : d.slug,
    }))
  }

  if (!loaded) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
          <p className="text-sm text-white/40 mt-1">{posts.length} posts · drag to reorder</p>
        </div>
        <button onClick={openCreate} className="admin-button flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Posts list */}
      <div className="glass-card">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {posts.map(post => (
                <SortableRow
                  key={post.id}
                  post={post}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onToggle={toggleVisibility}
                />
              ))}
              {posts.length === 0 && (
                <div className="p-12 text-center text-white/30 border border-dashed border-white/10 rounded-xl">
                  No blog posts yet. Click "New Post" to create your first one.
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Blog Post?"
        description="This will permanently remove the post and cannot be undone."
      />

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto py-20">
          <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative">

            {/* Modal header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold">{mode === 'create' ? 'Create Blog Post' : 'Edit Blog Post'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">

              {/* Cover image */}
              <FileUploadZone
                label="Cover Image"
                bucket="blog-images"
                value={draft.image_url}
                onUploadSuccess={(url: string) => setDraft({ ...draft, image_url: url })}
              />

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Title</label>
                <input
                  className="admin-input text-lg font-semibold"
                  placeholder="Post title..."
                  value={draft.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Page Slug</label>
                <input
                  className="admin-input font-mono text-sm"
                  placeholder="my-post-slug"
                  value={draft.slug}
                  onChange={e => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  required
                />
                <p className="text-xs text-white/30">URL: /blog/<strong>{draft.slug || 'slug'}</strong></p>
              </div>

              {/* Date + Category row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Date</label>
                  <input
                    className="admin-input"
                    placeholder="April 22, 2026"
                    value={draft.date}
                    onChange={e => setDraft({ ...draft, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Category</label>
                  <select
                    className="admin-input"
                    value={draft.category}
                    onChange={e => setDraft({ ...draft, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Excerpt / Main description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">
                  Main Description <span className="text-white/40 text-xs font-normal">(shown as page meta description)</span>
                </label>
                <textarea
                  className="admin-input min-h-[80px] resize-y"
                  placeholder="A short summary that appears in search results and social shares..."
                  value={draft.excerpt}
                  onChange={e => setDraft({ ...draft, excerpt: e.target.value })}
                />
              </div>

              {/* Sections — Q&A editor */}
              <div className="p-4 bg-white/3 rounded-xl border border-white/10">
                <SectionsEditor
                  sections={draft.sections}
                  onChange={(s: Section[]) => setDraft({ ...draft, sections: s })}
                />
              </div>

              {/* Visibility toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-purple-500"
                  checked={draft.is_visible}
                  onChange={e => setDraft({ ...draft, is_visible: e.target.checked })}
                />
                <span className="font-medium">Visible to Public</span>
              </label>

              {/* Footer actions */}
              <div className="sticky bottom-0 bg-[#0f0f13] pt-4 border-t border-white/10 flex justify-end gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="admin-button min-w-[120px]">
                  {saving ? 'Saving…' : mode === 'create' ? 'Publish Post' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
