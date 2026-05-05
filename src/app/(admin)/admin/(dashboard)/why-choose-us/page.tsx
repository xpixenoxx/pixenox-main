'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { TypographyPanel } from '@/components/admin/ui/TypographyPanel'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'
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

function SortableFeatureItem({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-start gap-4 bg-white/5 border border-white/5 p-4 rounded-lg
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing self-center">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-3 mb-1">
           {item.stat && <span className="text-2xl font-bold font-mono text-deep-purple">{item.stat}</span>}
           <h4 className="font-bold text-white text-lg">{item.label}</h4>
        </div>
        <p className="text-sm opacity-60 line-clamp-2">{item.description}</p>
      </div>

      <div className="flex items-center gap-2 self-center">
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

export default function WhyChooseUsPage() {
  const [config, setConfig] = useState<any>({
  })
  const [items, setItems] = useState<any[]>([])
  
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
      supabase.from('why_choose_us_config').select('*').limit(1).single(),
      supabase.from('why_choose_us').select('*').order('priority', { ascending: true })
    ])
    
    if (confData) setConfig(confData)
    if (listData) setItems(listData)
    setDidLoad(true)
  }

  const saveConfig = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSavingConfig(true)
     try {
       let res;
       const payload = { ...config }
       if (config.id) {
          res = await supabase.from('why_choose_us_config').update(payload).eq('id', config.id)
       } else {
          delete payload.id
          res = await supabase.from('why_choose_us_config').insert([payload])
       }
       if (res.error) throw res.error
       toast('Section configuration saved successfully', 'success')
       
       if (!config.id) {
         fetchData()
       }
     } catch(e:any) {
       toast(e.message, 'error')
     } finally {
       setIsSavingConfig(false)
     }
  }

  const handleConfigChange = (key: string, v: string) => setConfig({ ...config, [key]: v })
  const handleConfigExtChange = (prefix: string, key: string, value: string) => {
    const dbKey = `${prefix}_${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`
    setConfig({ ...config, [dbKey]: value })
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
      const { error } = await supabase.from('why_choose_us').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order', 'error')
       fetchData()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('why_choose_us').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Item deleted', 'success')
      setItems(items.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openCreate = () => {
    setItemToEdit({
       stat: '',
       label: '',
       description: '',
       icon_svg: '',
       priority: items.length
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
          res = await supabase.from('why_choose_us').insert([payload]).select().single()
       } else {
          res = await supabase.from('why_choose_us').update(payload).eq('id', itemToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Item ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message, 'error')
     }
  }

  const handleItemExtChange = (prefix: string, key: string, value: string) => {
    const dbKey = `${prefix}_${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`
    setItemToEdit({ ...itemToEdit, [dbKey]: value })
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      
      {/* Configuration Column */}
      <div className="flex flex-col gap-6">
         <form onSubmit={saveConfig} className="glass-card flex flex-col gap-8">
            <h3 className="text-xl font-bold">Section Config</h3>
            
            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Section Heading</label>
                  <input className="admin-input font-bold text-lg" value={config.section_heading} onChange={e => handleConfigChange('section_heading', e.target.value)} />
               </div>
               <TypographyPanel 
                  label="Heading"
                  values={{
                    color: config.heading_color,
                  }}
                  onChange={(k, v) => handleConfigExtChange('heading', k, v)}
               />
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Subheading / Description</label>
                  <textarea className="admin-input min-h-[80px]" value={config.section_subheading} onChange={e => handleConfigChange('section_subheading', e.target.value)} />
               </div>
               <TypographyPanel 
                  label="Subheading"
                  values={{
                    color: config.sub_color,
                  }}
                  onChange={(k, v) => handleConfigExtChange('sub', k, v)}
               />
            </div>

            <hr className="border-white/10" />

            <div className="flex flex-col gap-6">
               <h4 className="font-bold text-white/80">CTA Button Configuration</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-white/80">Text</label>
                   <input className="admin-input" value={config.cta_text || ''} onChange={(e) => handleConfigChange('cta_text', e.target.value)} />
                 </div>
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-white/80">URL</label>
                   <input className="admin-input" value={config.cta_url || ''} onChange={(e) => handleConfigChange('cta_url', e.target.value)} />
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ColorPicker label="Background Color" value={config.cta_bg_color || ''} onChange={(v) => handleConfigChange('cta_bg_color', v)} />
                 <ColorPicker label="Hover BG Color" value={config.cta_hover_bg_color || ''} onChange={(v) => handleConfigChange('cta_hover_bg_color', v)} />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="flex flex-col gap-1.5">
                   <label className="text-sm font-medium text-white/80">Border Radius</label>
                   <input className="admin-input" placeholder="e.g. 8px" value={config.cta_border_radius || ''} onChange={(e) => handleConfigChange('cta_border_radius', e.target.value)} />
                 </div>
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
               <button type="submit" disabled={isSavingConfig} className="admin-button">
                  {isSavingConfig ? 'Saving...' : 'Save Config'}
               </button>
            </div>
         </form>
      </div>

      {/* List Column */}
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Features & Stats</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> Add Item
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-2">
                {items.map(item => (
                   <SortableFeatureItem 
                     key={item.id} 
                     id={item.id} 
                     item={item} 
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {items.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No features/stats added yet.
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
        title="Delete Item?"
      />

      {/* Item Modal */}
      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Create Feature/Stat' : 'Edit Item'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
                  
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Stat (Optional)</label>
                        <input className="admin-input" placeholder="e.g. 100+, 99%" value={itemToEdit.stat || ''} onChange={e => setItemToEdit({...itemToEdit, stat: e.target.value})} />
                     </div>
                     <TypographyPanel 
                        label="Stat"
                        values={{
                          color: itemToEdit.stat_color,
                        }}
                        onChange={(k, v) => handleItemExtChange('stat', k, v)}
                     />
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Label</label>
                        <input className="admin-input" value={itemToEdit.label || ''} onChange={e => setItemToEdit({...itemToEdit, label: e.target.value})} required />
                     </div>
                     <TypographyPanel 
                        label="Label"
                        values={{
                          color: itemToEdit.label_color,
                        }}
                        onChange={(k, v) => handleItemExtChange('label', k, v)}
                     />
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Description</label>
                        <textarea className="admin-input min-h-[80px]" value={itemToEdit.description || ''} onChange={e => setItemToEdit({...itemToEdit, description: e.target.value})} />
                     </div>
                     <TypographyPanel 
                        label="Description"
                        values={{
                          color: itemToEdit.desc_color,
                        }}
                        onChange={(k, v) => handleItemExtChange('desc', k, v)}
                     />
                  </div>

                  <div className="flex justify-end gap-4 mt-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Item</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
