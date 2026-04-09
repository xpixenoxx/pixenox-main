'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { MultiImageUpload } from '@/components/admin/ui/MultiImageUpload'
import { RichTextEditor } from '@/components/admin/editors/RichTextEditor'
import { Edit, Trash2, GripVertical, Plus, X, ExternalLink, Star } from 'lucide-react'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableCaseStudyItem({ id, item, onEdit, onDelete, onToggleFeatured }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing self-center">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="w-32 h-20 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden self-center sm:self-auto">
        {item.cover_image_url || (item.gallery_images && item.gallery_images.length > 0) ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={item.cover_image_url || item.gallery_images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
           <span className="text-xs text-white/30 truncate px-1">No Cover</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1 w-full relative">
         <div className="flex items-center gap-2">
            <h4 className="font-bold truncate text-white text-lg">{item.title}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
               {item.status}
            </span>
         </div>
         <p className="text-sm opacity-60 truncate max-w-lg">{item.short_description || 'No description'}</p>
         <div className="flex gap-2 mt-1">
           {item.tags?.map((t:string) => (
             <span key={t} className="text-xs bg-white/10 text-white/70 px-1.5 py-0.5 rounded">{t}</span>
           ))}
         </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center mt-4 sm:mt-0 w-full sm:w-auto justify-end">
        <button 
          title="Toggle Featured"
          onClick={() => onToggleFeatured(item.id, !item.is_featured)}
          className={`p-2 rounded-lg transition-colors ${item.is_featured ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'}`}
        >
           <Star className="w-4 h-4" />
        </button>
        <button onClick={() => onEdit(item)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------

export default function CaseStudiesPage() {
  const [items, setItems] = useState<any[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [itemToEdit, setItemToEdit] = useState<any>(null)
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [
      { data: caseData },
      { data: tagsData }
    ] = await Promise.all([
      supabase.from('case_studies').select('*').order('priority', { ascending: true }),
      supabase.from('work_tags').select('id, label, slug').eq('is_visible', true)
    ])
    
    if (caseData) setItems(caseData)
    if (tagsData) setAvailableTags(tagsData)
    
    setDidLoad(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((list) => {
        const oldIndex = list.findIndex(i => i.id === active.id)
        const newIndex = list.findIndex(i => i.id === over.id)
        const newArr = arrayMove(list, oldIndex, newIndex)
        saveOrder(newArr)
        return newArr
      })
    }
  }

  const saveOrder = async (ordered: any[]) => {
    try {
      const updates = ordered.map((c, index) => ({ ...c, priority: index }))
      const { error } = await supabase.from('case_studies').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order: ' + e.message, 'error')
       fetchData()
    }
  }

  const toggleFeatured = async (id: string, customFeatured: boolean) => {
    setItems(items.map(c => c.id === id ? { ...c, is_featured: customFeatured } : c))
    await supabase.from('case_studies').update({ is_featured: customFeatured }).eq('id', id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('case_studies').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Case study deleted', 'success')
      setItems(items.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openEdit = (item: any) => {
    // Ensuring defaults for JSON strings if needed
    setItemToEdit({...item})
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setItemToEdit({
       title: '',
       slug: '',
       cover_image_url: '',
       short_description: '',
       body_content: '', // Can be HTML string or JSON
       tags: [],
       is_featured: false,
       status: 'draft',
       gallery_images: [],
       pitch_deck_images: [],
       priority: items.length
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...itemToEdit }
       delete payload.id
       
       // Auto-set cover_image_url from first gallery image
       if (payload.gallery_images && payload.gallery_images.length > 0) {
         payload.cover_image_url = payload.gallery_images[0]
       }
       
       // Handle body_content storage (stringifying JSON if object)
       if (typeof payload.body_content === 'object') {
          payload.body_content = JSON.stringify(payload.body_content)
       }

       let res;
       if (modalMode === 'create') {
          res = await supabase.from('case_studies').insert([payload]).select().single()
       } else {
          res = await supabase.from('case_studies').update(payload).eq('id', itemToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Case study ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message || 'Validation error', 'error')
     }
  }

  const toggleTag = (slug: string) => {
    const currentTags = itemToEdit.tags || []
    if (currentTags.includes(slug)) {
      setItemToEdit({ ...itemToEdit, tags: currentTags.filter((t:string) => t !== slug) })
    } else {
      setItemToEdit({ ...itemToEdit, tags: [...currentTags, slug] })
    }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Case Studies</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> New Case Study
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-2">
                {items.map(item => (
                   <SortableCaseStudyItem 
                     key={item.id} 
                     id={item.id} 
                     item={item} 
                     onToggleFeatured={toggleFeatured}
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {items.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No case studies found.
                   </div>
                )}
             </div>
           </SortableContext>
         </DndContext>
      </div>

      <ConfirmModal 
        isOpen={!!deleteData.id}
        onClose={() => setDeleteData({ id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Case Study?"
      />

      {/* Item Edit Modal */}
      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Create Case Study' : 'Edit Case Study'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-8 max-h-[75vh] overflow-y-auto">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="flex flex-col gap-6">
                        <MultiImageUpload 
                           label="Work Images (Top image is Cover)"
                           bucket="case-study"
                           values={itemToEdit.gallery_images || []}
                           onChange={urls => setItemToEdit({...itemToEdit, gallery_images: urls})}
                        />
                        
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Title</label>
                           <input className="admin-input" value={itemToEdit.title} onChange={e => {
                             const title = e.target.value
                             const slug = title.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                             setItemToEdit({...itemToEdit, title, slug})
                           }} required />
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Slug</label>
                           <input className="admin-input font-mono" value={itemToEdit.slug} onChange={e => setItemToEdit({...itemToEdit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
                        </div>
                     </div>

                     <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Status</label>
                           <select className="admin-input appearance-none" value={itemToEdit.status} onChange={e => setItemToEdit({...itemToEdit, status: e.target.value})}>
                             <option value="draft">Draft</option>
                             <option value="published">Published</option>
                           </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Tech Stack</label>
                           <input className="admin-input" placeholder="Comma-separated: React, Node.js, Supabase" defaultValue={(itemToEdit.tools_used || []).join(', ')} onBlur={e => setItemToEdit({...itemToEdit, tools_used: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)})} />
                           <p className="text-xs text-white/40">Enter technologies separated by commas. Changes apply when you click outside.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Length of Project</label>
                           <input className="admin-input" placeholder="e.g. 6 months, Ongoing since 2024" value={itemToEdit.project_length || ''} onChange={e => setItemToEdit({...itemToEdit, project_length: e.target.value})} />
                        </div>
                     </div>
                  </div>

                  <hr className="border-white/10" />

                  <div className="flex flex-col gap-2">
                     <label className="text-sm font-medium text-white/80">Work Tags</label>
                     <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                          const isActive = (itemToEdit.tags || []).includes(tag.slug)
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => toggleTag(tag.slug)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isActive ? 'bg-deep-purple border-deep-purple text-white' : 'bg-transparent border-white/20 text-white/60 hover:border-white/40'}`}
                            >
                              {tag.label}
                            </button>
                          )
                        })}
                     </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Short Description</label>
                     <textarea className="admin-input min-h-[80px]" value={itemToEdit.short_description || ''} onChange={e => setItemToEdit({...itemToEdit, short_description: e.target.value})} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Summary</label>
                     <RichTextEditor 
                       content={
                         typeof itemToEdit.body_content === 'string' && itemToEdit.body_content.startsWith('{')
                         ? JSON.parse(itemToEdit.body_content) 
                         : itemToEdit.body_content
                       }
                       onChange={(json) => setItemToEdit({...itemToEdit, body_content: JSON.stringify(json)})}
                     />
                  </div>

                  <hr className="border-white/10 my-4" />

                  <div className="flex flex-col gap-1.5">
                     <MultiImageUpload 
                        label="Pitch Deck Images"
                        bucket="case-study"
                        values={itemToEdit.pitch_deck_images || []}
                        onChange={urls => setItemToEdit({...itemToEdit, pitch_deck_images: urls})}
                     />
                     <p className="text-xs text-white/40">These images will be displayed sequentially as a presentation deck at the bottom of the case study.</p>
                  </div>
                  

                  <div className="sticky bottom-[-24px] bg-[#0f0f13] py-4 border-t border-white/10 flex justify-end gap-4 z-10 mt-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Case Study</button>
                  </div>
               </form>

            </div>
         </div>
      )}
    </div>
  )
}
