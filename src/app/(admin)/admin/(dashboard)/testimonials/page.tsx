'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { Eye, EyeOff, Edit, Trash2, GripVertical, Plus, X, Star } from 'lucide-react'

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

function SortableTestimonialItem({ id, item, onEdit, onDelete, onToggleVisibility }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing self-center">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="w-12 h-12 bg-black/40 rounded-full flex shrink-0 items-center justify-center overflow-hidden self-center sm:self-auto border border-white/10">
        {item.avatar_url ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
           <span className="text-xs text-white/30 font-medium">{item.reviewer_name?.[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1 w-full">
         <div className="flex items-center gap-2">
            <h4 className="font-bold text-white max-w-[200px] truncate">{item.reviewer_name}</h4>
            <span className="text-xs opacity-60 truncate">
               {item.reviewer_title} {item.company && `at ${item.company}`}
            </span>
         </div>
         <p className="text-sm opacity-80 italic line-clamp-2">"{item.review_text}"</p>
         <div className="flex text-yellow-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < (item.rating || 5) ? 'fill-yellow-500' : 'opacity-30'}`} />
            ))}
         </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center mt-4 sm:mt-0">
        <button 
          onClick={() => onToggleVisibility(item.id, !item.is_visible)}
          className={`p-2 rounded-lg transition-colors ${item.is_visible ? 'bg-deep-purple/20 text-deep-purple hover:bg-deep-purple/30' : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'}`}
        >
           {item.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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

export default function TestimonialsPage() {
  const [items, setItems] = useState<any[]>([])
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
    const { data } = await supabase.from('testimonials').select('*').order('priority', { ascending: true })
    if (data) setItems(data)
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
      const { error } = await supabase.from('testimonials').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order', 'error')
       fetchData()
    }
  }

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    setItems(items.map(c => c.id === id ? { ...c, is_visible: isVisible } : c))
    await supabase.from('testimonials').update({ is_visible: isVisible }).eq('id', id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
        const { error } = await supabase.from('testimonials').delete().eq('id', deleteData.id)
        if (error) throw error
        toast('Testimonial deleted', 'success')
        setItems(items.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
        toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openCreate = () => {
    setItemToEdit({
       reviewer_name: '',
       reviewer_title: '',
       company: '',
       avatar_url: '',
       company_logo_url: '',
       review_text: '',
       rating: 5,
       is_visible: true,
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
          res = await supabase.from('testimonials').insert([payload]).select().single()
       } else {
          res = await supabase.from('testimonials').update(payload).eq('id', itemToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Testimonial ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message, 'error')
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-xl font-bold">Client Testimonials</h3>
            </div>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> Add Testimonial
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-2">
                {items.map(item => (
                   <SortableTestimonialItem 
                     key={item.id} 
                     id={item.id} 
                     item={item} 
                     onToggleVisibility={toggleVisibility}
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {items.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No testimonials added yet.
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
        title="Delete Testimonial?"
      />

      {isModalOpen && itemToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FileUploadZone 
                       label="Reviewer Avatar"
                       bucket="avatars"
                       value={itemToEdit.avatar_url}
                       onUploadSuccess={url => setItemToEdit({...itemToEdit, avatar_url: url})}
                    />
                    <FileUploadZone 
                       label="Company Logo (Optional)"
                       bucket="company-logos"
                       value={itemToEdit.company_logo_url}
                       onUploadSuccess={url => setItemToEdit({...itemToEdit, company_logo_url: url})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Reviewer Name</label>
                        <input className="admin-input" value={itemToEdit.reviewer_name || ''} onChange={e => setItemToEdit({...itemToEdit, reviewer_name: e.target.value})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Job Title</label>
                        <input className="admin-input" value={itemToEdit.reviewer_title || ''} onChange={e => setItemToEdit({...itemToEdit, reviewer_title: e.target.value})} />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Company</label>
                        <input className="admin-input" value={itemToEdit.company || ''} onChange={e => setItemToEdit({...itemToEdit, company: e.target.value})} />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Rating</label>
                        <select className="admin-input appearance-none" value={itemToEdit.rating || 5} onChange={e => setItemToEdit({...itemToEdit, rating: parseInt(e.target.value)})}>
                           {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Review Quote</label>
                     <textarea className="admin-input min-h-[120px]" value={itemToEdit.review_text || ''} onChange={e => setItemToEdit({...itemToEdit, review_text: e.target.value})} required />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 accent-deep-purple"
                       checked={itemToEdit.is_visible} 
                       onChange={e => setItemToEdit({...itemToEdit, is_visible: e.target.checked})} 
                     />
                     <span className="font-medium">Visible on standard queries</span>
                  </label>

                  <div className="flex justify-end gap-4 mt-2 mb-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Testimonial</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
