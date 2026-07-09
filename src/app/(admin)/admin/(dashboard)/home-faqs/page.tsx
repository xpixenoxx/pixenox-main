'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { Eye, EyeOff, Edit, Trash2, GripVertical, Plus, X } from 'lucide-react'

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

function SortableHomeFaqItem({ id, faq, onEdit, onDelete, onToggleVisibility }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-start gap-4 bg-white/5 border border-white/5 p-4 rounded-xl
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="mt-1 p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <h4 className="font-bold text-white text-lg">{faq.question}</h4>
        <p className="text-sm text-white/60 line-clamp-2">{faq.answer}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button 
          onClick={() => onToggleVisibility(faq.id, !faq.is_visible)}
          className={`p-2 rounded-lg transition-colors ${faq.is_visible ? 'bg-deep-purple/20 text-deep-purple hover:bg-deep-purple/30' : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'}`}
        >
           {faq.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(faq)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(faq.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function HomeFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [faqToEdit, setFaqToEdit] = useState<any>(null)
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('home_faqs').select('*').order('priority', { ascending: true })
    if (data) setFaqs(data)
    setDidLoad(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFaqs((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        const newArr = arrayMove(items, oldIndex, newIndex)
        saveOrder(newArr)
        return newArr
      })
    }
  }

  const saveOrder = async (ordered: any[]) => {
    try {
      const updates = ordered.map((c, index) => ({ ...c, priority: index }))
      const { error } = await supabase.from('home_faqs').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order', 'error')
       fetchData()
    }
  }

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    setFaqs(faqs.map(c => c.id === id ? { ...c, is_visible: isVisible } : c))
    try {
      const { error } = await supabase.from('home_faqs').update({ is_visible: isVisible }).eq('id', id)
      if (error) throw error
    } catch (e:any) {
      fetchData()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('home_faqs').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Home FAQ deleted', 'success')
      setFaqs(faqs.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openEdit = (faq: any) => {
    setFaqToEdit(faq)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setFaqToEdit({
       question: '',
       answer: '',
       is_visible: true,
       priority: faqs.length
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...faqToEdit }
       delete payload.id
       
       let res;
       if (modalMode === 'create') {
          res = await supabase.from('home_faqs').insert([payload]).select().single()
       } else {
          res = await supabase.from('home_faqs').update(payload).eq('id', faqToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Home FAQ ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message || 'Validation error', 'error')
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-xl font-bold">Home FAQs</h3>
               <p className="text-sm opacity-60">Manage FAQs specifically for the home page</p>
            </div>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm z-10 relative">
               <Plus className="w-4 h-4" /> Add FAQ
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={faqs.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-3">
                {faqs.map(faq => (
                   <SortableHomeFaqItem 
                     key={faq.id} 
                     id={faq.id} 
                     faq={faq} 
                     onToggleVisibility={toggleVisibility}
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {faqs.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No Home FAQs created yet.
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
        title="Delete Home FAQ?"
        description="This will instantly remove it from the home page."
      />

      {isModalOpen && faqToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative">
               <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Create Home FAQ' : 'Edit Home FAQ'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Question</label>
                     <input 
                       className="admin-input text-lg font-medium" 
                       value={faqToEdit.question} 
                       onChange={e => setFaqToEdit({...faqToEdit, question: e.target.value})} 
                       placeholder="e.g. How do we start?"
                       required 
                     />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Answer</label>
                     <textarea 
                       className="admin-input min-h-[160px] resize-y" 
                       value={faqToEdit.answer} 
                       onChange={e => setFaqToEdit({...faqToEdit, answer: e.target.value})} 
                       placeholder="Provide a concise answer..."
                       required 
                     />
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10 mt-2">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 accent-deep-purple"
                       checked={faqToEdit.is_visible} 
                       onChange={e => setFaqToEdit({...faqToEdit, is_visible: e.target.checked})} 
                     />
                     <span className="font-medium">Visible on Home Page</span>
                  </label>

                  <div className="flex justify-end gap-4 mt-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Home FAQ</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
