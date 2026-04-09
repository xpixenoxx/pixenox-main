'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { Edit, Trash2, Plus, X } from 'lucide-react'

export default function SeoPage() {
  const [items, setItems] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('seo_config').select('*').order('page', { ascending: true })
    if (data) setItems(data)
    setDidLoad(true)
  }

  const handleDelete = async (id: string, page: string) => {
    if (!confirm(`Are you sure you want to delete SEO settings for /${page}?`)) return;
    try {
      const { error } = await supabase.from('seo_config').delete().eq('id', id)
      if (error) throw error
      toast(`Deleted SEO config for /${page}`, 'success')
      setItems(items.filter(c => c.id !== id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openCreate = () => {
    setItemToEdit({
       page: 'new-page',
       title: '',
       description: '',
       og_image_url: '',
       canonical_url: '',
       keywords: []
    })
    setIsModalOpen(true)
  }

  const openEdit = (item: any) => {
    setItemToEdit({...item})
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSaving(true)
     try {
       const payload = { ...itemToEdit }
       delete payload.id

       // check if unique page exists using a simple lookup
       const existing = items.find(i => i.page === payload.page && i.id !== itemToEdit.id)
       if (existing) {
         toast(`Config for page ${payload.page} already exists. Please edit instead.`, 'error')
         return
       }
       
       let res;
       if (itemToEdit.id) {
          res = await supabase.from('seo_config').update(payload).eq('id', itemToEdit.id).select().single()
       } else {
          res = await supabase.from('seo_config').insert([payload]).select().single()
       }

       if (res.error) throw res.error
       toast(`SEO config optimized successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message, 'error')
     } finally {
       setIsSaving(false)
     }
  }

  const handleKeywordsChange = (val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setItemToEdit({...itemToEdit, keywords: arr})
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-xl font-bold">SEO & Meta Configuration</h3>
               <p className="text-sm opacity-60">Manage Title Arrays, Meta Descriptions, Canonical URLs, Open Graph Data per-page.</p>
            </div>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> Add Page Rule
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(item => (
               <div key={item.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col relative overflow-hidden group">
                  {item.og_image_url && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-deep-purple/50" />
                  )}
                  
                  <div className="flex justify-between items-start mb-2">
                     <span className="bg-deep-purple/20 text-deep-purple px-2 py-0.5 rounded text-xs font-mono font-bold tracking-wider uppercase">
                         Page: /{item.page === 'home' ? '' : item.page}
                     </span>
                     <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEdit(item)} className="p-1 hover:bg-white/10 rounded"><Edit className="w-3.5 h-3.5 text-white/70" /></button>
                         <button onClick={() => handleDelete(item.id, item.page)} className="p-1 hover:bg-red-500/20 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                     </div>
                  </div>
                  
                  <h4 className="font-bold text-white text-lg mb-1 truncate">{item.title}</h4>
                  <p className="text-xs opacity-60 line-clamp-3 mb-3">{item.description}</p>
               </div>
            ))}
            
            {items.length === 0 && (
               <div className="p-8 col-span-3 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                  No SEO configurations provided. Defaults will apply across all routes.
               </div>
            )}
         </div>
      </div>

      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{itemToEdit.id ? 'Edit Page Rule' : 'New Page Rule'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Page Path / Slug</label>
                     <input className="admin-input font-mono" placeholder="Use 'home' for root, or standard string like 'about'" value={itemToEdit.page} onChange={e => setItemToEdit({...itemToEdit, page: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Title Tag (Meta)</label>
                     <input className="admin-input text-lg" value={itemToEdit.title || ''} onChange={e => setItemToEdit({...itemToEdit, title: e.target.value})} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Meta Description</label>
                     <textarea className="admin-input min-h-[100px]" value={itemToEdit.description || ''} onChange={e => setItemToEdit({...itemToEdit, description: e.target.value})} />
                     <p className="text-xs text-white/40 text-right mt-1">{itemToEdit.description?.length || 0} / 160 Recommended</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Canonical URL Override</label>
                     <input className="admin-input font-mono" placeholder="Leave empty to use automatic path routing" value={itemToEdit.canonical_url || ''} onChange={e => setItemToEdit({...itemToEdit, canonical_url: e.target.value})} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Keywords (Comma separated)</label>
                     <input className="admin-input" placeholder="Enterprise, Design, Analytics" value={(itemToEdit.keywords || []).join(', ')} onChange={e => handleKeywordsChange(e.target.value)} />
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                     <FileUploadZone 
                        label="Open Graph Image Backup"
                        bucket="og-images"
                        value={itemToEdit.og_image_url}
                        onUploadSuccess={(url) => setItemToEdit({...itemToEdit, og_image_url: url})}
                     />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-white hover:bg-white/10">Cancel</button>
                     <button type="submit" disabled={isSaving} className="admin-button">{isSaving ? 'Saving...' : 'Save Meta'}</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
