'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { Edit, Trash2, GripVertical, Plus, X } from 'lucide-react'

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

function SortableFooterLink({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-lg
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="px-1 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex-1 min-w-0 grid grid-cols-[100px_1fr_1fr] gap-4 items-center">
        <span className="text-xs bg-black/40 px-2 py-1 rounded text-white/60 font-mono text-center truncate">{item.section}</span>
        <span className="font-bold text-white text-sm truncate">{item.label}</span>
        <span className="text-sm opacity-50 truncate">{item.href}</span>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function FooterPage() {
  const [config, setConfig] = useState<any>({
     id: '', linkedin_url: '', github_url: '', reddit_url: '', copyright_text: '© 2026 Pixenox. All rights reserved.'
  })
  const [links, setLinks] = useState<any[]>([])
  
  const [didLoad, setDidLoad] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [itemToEdit, setItemToEdit] = useState<any>(null)
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [{ data: confData }, { data: listData }] = await Promise.all([
      supabase.from('footer_config').select('*').limit(1).single(),
      supabase.from('footer_links').select('*').order('priority', { ascending: true })
    ])
    
    if (confData) setConfig(confData)
    if (listData) setLinks(listData)
    setDidLoad(true)
  }

  const saveConfig = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSavingConfig(true)
     try {
       let res;
       const payload = { ...config }
       if (config.id) {
          res = await supabase.from('footer_config').update(payload).eq('id', config.id)
       } else {
          delete payload.id
          res = await supabase.from('footer_config').insert([payload])
       }
       if (res.error) throw res.error
       toast('Footer config saved', 'success')
       if (!config.id) fetchData()
     } catch(e:any) {
       toast(e.message, 'error')
     } finally {
       setIsSavingConfig(false)
     }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setLinks((list) => {
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
      const { error } = await supabase.from('footer_links').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order', 'error')
       fetchData()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('footer_links').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Link deleted', 'success')
      setLinks(links.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openCreate = () => {
    setItemToEdit({
       section: 'Company',
       label: '',
       href: '/',
       is_visible: true,
       priority: links.length
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const openEdit = (item: any) => {
    setItemToEdit({...item})
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...itemToEdit }
       delete payload.id
       
       let res;
       if (modalMode === 'create') {
          res = await supabase.from('footer_links').insert([payload]).select().single()
       } else {
          res = await supabase.from('footer_links').update(payload).eq('id', itemToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Link ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message, 'error')
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
         <form onSubmit={saveConfig} className="glass-card flex flex-col gap-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-2">Global Settings & Socials</h3>
            
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-white/80">Copyright Text</label>
               <input className="admin-input" value={config.copyright_text} onChange={e => setConfig({...config, copyright_text: e.target.value})} />
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">LinkedIn URL</label>
                  <input className="admin-input" placeholder="https://linkedin.com/company/pixenox" value={config.linkedin_url || ''} onChange={e => setConfig({...config, linkedin_url: e.target.value})} />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">GitHub URL</label>
                  <input className="admin-input" placeholder="https://github.com/..." value={config.github_url || ''} onChange={e => setConfig({...config, github_url: e.target.value})} />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Reddit URL / Other</label>
                  <input className="admin-input" placeholder="https://reddit.com/r/..." value={config.reddit_url || ''} onChange={e => setConfig({...config, reddit_url: e.target.value})} />
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
               <button type="submit" disabled={isSavingConfig} className="admin-button">
                  {isSavingConfig ? 'Saving...' : 'Save Settings'}
               </button>
            </div>
         </form>
      </div>

      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Footer Links</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-3 py-1.5 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> Add Link
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={links.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-2">
                {links.map(item => (
                   <SortableFooterLink 
                     key={item.id} 
                     id={item.id} 
                     item={item} 
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {links.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No URL Links added yet.
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
        title="Delete Footer Link?"
      />

      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-sm w-full shadow-2xl relative">
               <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-lg font-bold">{modalMode === 'create' ? 'Add Link' : 'Edit Link'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Section Heading</label>
                     <input className="admin-input" placeholder="e.g. Services, Company, Legal" value={itemToEdit.section} onChange={e => setItemToEdit({...itemToEdit, section: e.target.value})} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Link Label</label>
                     <input className="admin-input" value={itemToEdit.label} onChange={e => setItemToEdit({...itemToEdit, label: e.target.value})} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Href / URL</label>
                     <input className="admin-input font-mono text-sm" value={itemToEdit.href} onChange={e => setItemToEdit({...itemToEdit, href: e.target.value})} required />
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer py-2">
                     <input 
                       type="checkbox" 
                       className="w-4 h-4 accent-deep-purple"
                       checked={itemToEdit.is_visible} 
                       onChange={e => setItemToEdit({...itemToEdit, is_visible: e.target.checked})} 
                     />
                     <span className="text-sm font-medium">Visible to Public</span>
                  </label>

                  <div className="flex justify-end gap-3 mt-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-white text-sm hover:bg-white/10">Cancel</button>
                     <button type="submit" className="admin-button py-2 text-sm">Save Link</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
