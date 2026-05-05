'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'
import { Edit, Trash2, GripVertical, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'

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

function SortableItem({ id, item, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="px-1 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
           <span className="text-white/40 font-mono text-sm">{(item.priority + 1).toString().padStart(2, '0')}</span>
           <span className="font-bold text-white tracking-widest uppercase truncate">{item.category_name}</span>
           {!item.is_visible && <span className="text-xs bg-red-500/20 text-red-300 px-2 rounded-full border border-red-500/30">Hidden</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
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

export default function TechnologyStackPage() {
  const [didLoad, setDidLoad] = useState(false)
  const [config, setConfig] = useState<any>({
     id: '', 
     section_heading: 'TECHNOLOGY STACK',
     heading_color: '#ffffff'
  })
  
  const [stackItems, setStackItems] = useState<any[]>([])
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)

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
      supabase.from('technology_stack_config').select('*').limit(1).single(),
      supabase.from('technology_stack').select('*').order('priority', { ascending: true })
    ])
    
    if (confData) setConfig(confData)
    if (listData) setStackItems(listData)
    setDidLoad(true)
  }

  const saveConfig = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSavingConfig(true)
     try {
       let res;
       const payload = { ...config }
       if (config.id) {
          res = await supabase.from('technology_stack_config').update(payload).eq('id', config.id)
       } else {
          delete payload.id
          res = await supabase.from('technology_stack_config').insert([payload])
       }
       if (res.error) throw res.error
       toast('Configuration saved successfully', 'success')
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
      setStackItems((list) => {
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
      const { error } = await supabase.from('technology_stack').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order', 'error')
       fetchData()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('technology_stack').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Item deleted', 'success')
      setStackItems(stackItems.filter(c => c.id !== deleteData.id))
      setDeleteData({ id: null })
      fetchData() // to fix priorities
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openCreate = () => {
    setItemToEdit({
       category_name: '',
       category_color: '#ffffff',
       priority: stackItems.length,
       is_visible: true
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
          res = await supabase.from('technology_stack').insert([payload])
       } else {
          res = await supabase.from('technology_stack').update(payload).eq('id', itemToEdit.id)
       }

       if (res.error) throw res.error
       toast(`Item ${modalMode === 'create' ? 'created' : 'updated'}`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message, 'error')
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
      
      {/* Configuration Column */}
      <div className="flex flex-col gap-6">
         <form onSubmit={saveConfig} className="glass-card flex flex-col gap-6">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">Technology Stack Settings</h3>
            
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-white/80">Section Heading</label>
               <input className="admin-input" value={config.section_heading} onChange={e => setConfig({...config, section_heading: e.target.value})} required />
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden mt-2">
               <button type="button" onClick={() => setShowAdvancedConfig(!showAdvancedConfig)} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="font-semibold">Advanced Typography</span>
                  {showAdvancedConfig ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
               </button>
               {showAdvancedConfig && (
                  <div className="p-4 bg-black/20 flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-white/80">Heading Weight</label>
                         </div>
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-white/80">Heading Size</label>
                         </div>
                         <div className="flex flex-col gap-1.5 pt-7">
                            <ColorPicker color={config.heading_color} onChange={v => setConfig({...config, heading_color: v})} />
                         </div>
                      </div>
                  </div>
               )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
               <button type="submit" disabled={isSavingConfig} className="admin-button px-8">
                  {isSavingConfig ? 'Saving...' : 'Save Settings'}
               </button>
            </div>
         </form>
      </div>

      {/* Items Column */}
      <div className="glass-card flex flex-col h-fit">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Categories</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative shadow-lg shadow-deep-purple/20">
               <Plus className="w-4 h-4" /> Add Category
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={stackItems.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-3">
                {stackItems.map(item => (
                   <SortableItem 
                     key={item.id} 
                     id={item.id} 
                     item={item} 
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {stackItems.length === 0 && (
                   <div className="p-12 text-center text-white/50 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                         <Plus className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="font-semibold text-lg text-white/70">No categories added</p>
                      <p className="text-sm mt-1">Add your first stack category to get started.</p>
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
        title="Delete Category?"
        description="This will permanently remove this technology stack category. Are you sure?"
      />

      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-xl w-full shadow-[0_0_50px_rgba(74,14,143,0.3)] relative max-h-[90vh] overflow-y-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-md z-10">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Add Stack Category' : 'Edit Category'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-8">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-base font-semibold text-white">Category Name</label>
                     <input 
                       className="admin-input text-lg font-bold placeholder:font-normal" 
                       placeholder="e.g. FRONTEND PLATFORMS (REACT / NEXT)" 
                       value={itemToEdit.category_name} 
                       onChange={e => setItemToEdit({...itemToEdit, category_name: e.target.value})} 
                       required 
                     />
                  </div>
                  
                  <div className="p-5 border border-white/10 bg-white/5 rounded-xl flex flex-col gap-5">
                    <h4 className="font-semibold text-sm text-white/60 uppercase tracking-wider">Typography Override</h4>
                    <div className="grid grid-cols-2 gap-5">
                       <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-white/80">Font Weight</label>
                       </div>
                       <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-white/80">Font Size</label>
                       </div>
                       <div className="flex flex-col gap-1.5 pt-7">
                          <ColorPicker color={itemToEdit.category_color} onChange={v => setItemToEdit({...itemToEdit, category_color: v})} />
                       </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 accent-deep-purple"
                       checked={itemToEdit.is_visible} 
                       onChange={e => setItemToEdit({...itemToEdit, is_visible: e.target.checked})} 
                     />
                     <div className="flex flex-col">
                       <span className="font-semibold text-white text-base">Visible to Public</span>
                       <span className="text-sm text-white/50">If unchecked, this category will be hidden from the real website.</span>
                     </div>
                  </label>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#0a0a0f] pb-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-white font-medium hover:bg-white/10 transition-colors">Cancel</button>
                     <button type="submit" className="admin-button px-8 py-2.5 shadow-lg shadow-deep-purple/20">Save Category</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
