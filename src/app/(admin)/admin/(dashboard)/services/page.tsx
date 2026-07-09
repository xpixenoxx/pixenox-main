'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'
import { TypographyPanel } from '@/components/admin/ui/TypographyPanel'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
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

function SortableItem({ id, card, onEdit, onDelete, onToggleVisibility }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg
      ${isDragging ? 'shadow-2xl shadow-deep-purple/50 bg-white/10 ring-2 ring-deep-purple' : ''}
    `}>
      <button {...attributes} {...listeners} className="p-2 text-white/30 hover:text-white/60 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="w-16 h-12 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden">
        {card.image_url ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={card.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
           <span className="text-xs text-white/30 truncate px-1">IMG</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold truncate text-white">{card.title}</h4>
        <p className="text-sm opacity-60 truncate">{card.page_slug}</p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => onToggleVisibility(card.id, !card.is_visible)}
          className={`p-2 rounded-lg transition-colors ${card.is_visible ? 'bg-deep-purple/20 text-deep-purple hover:bg-deep-purple/30' : 'bg-white/5 text-white/30 hover:text-white/70 hover:bg-white/10'}`}
        >
           {card.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button onClick={() => onEdit(card)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(card.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------

export default function ServicesPage() {
  const [layout, setLayout] = useState({ id: '', layout_type: 'horizontal', cards_per_row: 3 })
  const [cards, setCards] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [cardToEdit, setCardToEdit] = useState<any>(null)
  
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Layout
    const { data: layoutData } = await supabase.from('services_layout').select('*').limit(1).single()
    if (layoutData) setLayout(layoutData)

    // Cards
    const { data: cardsData } = await supabase.from('services_cards').select('*').order('priority', { ascending: true })
    if (cardsData) setCards(cardsData)
    
    setDidLoad(true)
  }

  // ==== Layout Saving ====
  const saveLayout = async () => {
     try {
        let res;
        if (layout.id) {
           res = await supabase.from('services_layout').update({ layout_type: layout.layout_type, cards_per_row: layout.cards_per_row }).eq('id', layout.id)
        } else {
           res = await supabase.from('services_layout').insert([{ layout_type: layout.layout_type, cards_per_row: layout.cards_per_row }])
           // fetch new id
           fetchData()
        }
        if (res.error) throw res.error
        toast('Layout saved', 'success')
     } catch (e: any) {
        toast(e.message, 'error')
     }
  }

  // ==== Drag Drop Handling ====
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        const newArr = arrayMove(items, oldIndex, newIndex)
        
        // Batch update priority in background
        saveOrder(newArr)
        return newArr
      })
    }
  }

  const saveOrder = async (orderedCards: any[]) => {
    try {
      const updates = orderedCards.map((c, index) => ({
        ...c, priority: index
      }))
      
      const { error } = await supabase.from('services_cards').upsert(updates)
      if (error) throw error
    } catch (e: any) {
       toast('Failed to save order: ' + e.message, 'error')
       fetchData() // revert
    }
  }

  // ==== Card Row Actions ====
  const toggleVisibility = async (id: string, isVisible: boolean) => {
    // optimistic
    setCards(cards.map(c => c.id === id ? { ...c, is_visible: isVisible } : c))
    try {
      const { error } = await supabase.from('services_cards').update({ is_visible: isVisible }).eq('id', id)
      if (error) throw error
    } catch (e:any) {
      toast('Update failed', 'error')
      fetchData()
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('services_cards').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Card deleted', 'success')
      setCards(cards.filter(c => c.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
  }

  const openEdit = (card: any) => {
    setCardToEdit(card)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setCardToEdit({
       title: 'New Service',
       page_slug: 'new-service' + Math.floor(Math.random()*1000),
       technology_stack: [],
       icon_svg: '',
       is_visible: true,
       priority: cards.length
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...cardToEdit }
       delete payload.id // remove id safely
       
       let res;
       if (modalMode === 'create') {
          res = await supabase.from('services_cards').insert([payload]).select().single()
       } else {
          res = await supabase.from('services_cards').update(payload).eq('id', cardToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Service ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message || 'Validation error', 'error')
     }
  }

  // Tools mapping handles ExtChange for TypographyPanel
  const handleExtChange = (field: string, k: string, v: string) => {
     const dbKey = `${field === 'desc' ? 'desc' : field}_${k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`
     setCardToEdit({ ...cardToEdit, [dbKey]: v })
  }


  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      
      {/* Top Layout Controls */}
      <div className="glass-card flex flex-col md:flex-row items-end gap-6 justify-between">
         <div className="flex gap-8">
            <div className="flex flex-col gap-2">
               <label className="text-sm font-medium text-white/80">Layout Type</label>
               <div className="flex bg-black/40 p-1 rounded-lg">
                  <button 
                    onClick={() => setLayout({...layout, layout_type: 'horizontal'})}
                    className={`px-4 py-2 ${layout.layout_type === 'horizontal' ? 'bg-deep-purple rounded text-white font-medium shadow' : 'text-white/60 hover:text-white'}`}
                  > Horizontal Scroll </button>
                  <button 
                    onClick={() => setLayout({...layout, layout_type: 'vertical'})}
                    className={`px-4 py-2 ${layout.layout_type === 'vertical' ? 'bg-deep-purple rounded text-white font-medium shadow' : 'text-white/60 hover:text-white'}`}
                  > Vertical Grid </button>
               </div>
            </div>

            {layout.layout_type === 'vertical' && (
               <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-white/80">Cards Per Row</label>
                 <select 
                   className="admin-input" 
                   value={layout.cards_per_row}
                   onChange={e => setLayout({...layout, cards_per_row: parseInt(e.target.value)})}
                 >
                   <option value={2}>2 Cards</option>
                   <option value={3}>3 Cards</option>
                   <option value={4}>4 Cards</option>
                 </select>
               </div>
            )}
         </div>

         <button onClick={saveLayout} className="admin-button shrink-0">
           Save Layout
         </button>
      </div>

      {/* Cards List */}
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Service Cards</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm">
               <Plus className="w-4 h-4" /> Add Card
            </button>
         </div>

         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
           <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
             <div className="flex flex-col gap-2">
                {cards.map(card => (
                   <SortableItem 
                     key={card.id} 
                     id={card.id} 
                     card={card} 
                     onToggleVisibility={toggleVisibility}
                     onDelete={(id: string) => setDeleteData({ id })}
                     onEdit={openEdit}
                   />
                ))}
                {cards.length === 0 && (
                   <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                      No service cards found.
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
        title="Delete Service Card?"
        description="This will instantly remove the card from the database. It cannot be recovered."
      />

      {/* Card Edit Modal */}
      {isModalOpen && cardToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Create Service Card' : 'Edit Card'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-8 max-h-[70vh] overflow-y-auto">
                  
                  <FileUploadZone 
                     label="Cover Image"
                     bucket="service-images"
                     value={cardToEdit.image_url}
                     onUploadSuccess={url => setCardToEdit({...cardToEdit, image_url: url})}
                  />

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Page Slug</label>
                     <input className="admin-input" value={cardToEdit.page_slug || ''} onChange={e => setCardToEdit({...cardToEdit, page_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
                     <p className="text-xs text-white/40 mt-1">Used for the URL: /services/{"{slug}"}</p>
                  </div>

                  {/* Icon SVG */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                     <label className="text-sm font-medium text-white/80">Icon SVG</label>
                     <div className="flex gap-4 items-start">
                        <textarea className="admin-input flex-1 min-h-[80px] font-mono text-xs" placeholder='Paste SVG code, e.g. <svg width="24" height="24" ...>...</svg>' value={cardToEdit.icon_svg || ''} onChange={e => setCardToEdit({...cardToEdit, icon_svg: e.target.value})} />
                        {cardToEdit.icon_svg && (
                           <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg border border-white/10 text-white shrink-0" dangerouslySetInnerHTML={{ __html: cardToEdit.icon_svg }} />
                        )}
                     </div>
                     <p className="text-xs text-white/40">Paste raw SVG markup. This icon will appear in the Services mega menu.</p>
                  </div>

                  {/* Title Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Title</label>
                        <input className="admin-input" value={cardToEdit.title || ''} onChange={e => setCardToEdit({...cardToEdit, title: e.target.value})} required />
                     </div>
                     <TypographyPanel 
                        label="Title"
                        values={{
                          color: cardToEdit.title_color,
                        }}
                        onChange={(k, v) => handleExtChange('title', k, v)}
                     />
                  </div>

                  {/* Subheading Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Subheading</label>
                        <input className="admin-input" value={cardToEdit.subheading || ''} onChange={e => setCardToEdit({...cardToEdit, subheading: e.target.value})} />
                     </div>
                     <TypographyPanel 
                        label="Subheading"
                        values={{
                          color: cardToEdit.subheading_color,
                        }}
                        onChange={(k, v) => handleExtChange('subheading', k, v)}
                     />
                  </div>

                  {/* Description Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Description</label>
                        <textarea className="admin-input min-h-[100px]" value={cardToEdit.description || ''} onChange={e => setCardToEdit({...cardToEdit, description: e.target.value})} />
                     </div>
                     <TypographyPanel 
                        label="Description"
                        values={{
                          color: cardToEdit.desc_color,
                        }}
                        onChange={(k, v) => handleExtChange('desc', k, v)}
                     />
                  </div>

                  {/* What You Get Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white">What You Get Section</h3>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Section Heading</label>
                        <input className="admin-input" placeholder="e.g. What you get" value={cardToEdit.what_you_get_heading || ''} onChange={e => setCardToEdit({...cardToEdit, what_you_get_heading: e.target.value})} />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Section Description</label>
                        <textarea className="admin-input min-h-[60px]" placeholder="e.g. Production-ready AI..." value={cardToEdit.what_you_get_description || ''} onChange={e => setCardToEdit({...cardToEdit, what_you_get_description: e.target.value})} />
                     </div>
                     <div className="flex flex-col gap-2 mt-2">
                        <label className="text-sm font-medium text-white/80">Service Items</label>
                        <p className="text-xs text-white/40 mb-2">Each item will appear as a row with a number and title/description.</p>
                        <div className="flex flex-col gap-4">
                           {(cardToEdit.what_you_get_items || []).map((item: any, i: number) => (
                              <div key={i} className="flex gap-4 items-start border border-white/10 p-4 rounded-xl bg-white/5">
                                 <div className="w-8 h-10 flex items-center justify-center font-mono text-sm text-white/40">{(i+1).toString().padStart(2, '0')}</div>
                                 <div className="flex flex-col flex-1 gap-3">
                                    <input 
                                      className="admin-input" 
                                      placeholder="Service Name (e.g. LLM APPS & RAG)"
                                      value={item?.title || ''}
                                      onChange={e => {
                                         const newItems = [...(cardToEdit.what_you_get_items || [])];
                                         newItems[i] = { ...(item || {}), title: e.target.value };
                                         setCardToEdit({...cardToEdit, what_you_get_items: newItems});
                                      }}
                                    />
                                    <textarea 
                                      className="admin-input min-h-[60px] text-sm" 
                                      placeholder="Description" 
                                      value={item?.desc || ''}
                                      onChange={e => {
                                         const newItems = [...(cardToEdit.what_you_get_items || [])];
                                         newItems[i] = { ...(item || {}), desc: e.target.value };
                                         setCardToEdit({...cardToEdit, what_you_get_items: newItems});
                                      }} 
                                    />
                                    <div className="flex gap-4 items-start">
                                       <textarea 
                                          className="admin-input flex-1 min-h-[60px] font-mono text-xs" 
                                          placeholder="Optional SVG Icon (e.g. <svg>...</svg>)" 
                                          value={item?.icon_svg || ''} 
                                          onChange={e => {
                                             const newItems = [...(cardToEdit.what_you_get_items || [])];
                                             newItems[i] = { ...(item || {}), icon_svg: e.target.value };
                                             setCardToEdit({...cardToEdit, what_you_get_items: newItems});
                                          }} 
                                       />
                                    </div>
                                 </div>
                                 <button type="button" onClick={() => {
                                    const newItems = [...(cardToEdit.what_you_get_items || [])];
                                    newItems.splice(i, 1);
                                    setCardToEdit({...cardToEdit, what_you_get_items: newItems});
                                 }} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors mt-1">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           ))}
                           <button type="button" onClick={() => {
                              setCardToEdit({...cardToEdit, what_you_get_items: [...(cardToEdit.what_you_get_items || []), {title: '', desc: '', icon_svg: ''}]});
                           }} className="admin-button self-start mt-2 px-3 py-1.5 text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add Item
                           </button>
                        </div>
                     </div>
                  </div>
                  
                  {/* Technology Stack Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">Tools & Technology Logos</label>
                        <p className="text-xs text-white/40 mb-2">Each SVG pasted here will appear in the "Tools" grid on the service cards.</p>
                        <div className="flex flex-col gap-4">
                           {(cardToEdit.technology_stack || []).map((tech: any, i: number) => {
                              const name = typeof tech === 'string' ? tech : (tech?.name || '');
                              const svg = typeof tech === 'string' ? '' : (tech?.svg || '');
                              return (
                              <div key={i} className="flex gap-4 items-start border border-white/10 p-4 rounded-xl bg-white/5">
                                 <div className="w-8 h-10 flex items-center justify-center font-mono text-sm text-white/40">{(i+1).toString().padStart(2, '0')}</div>
                                 <div className="flex flex-col flex-1 gap-3">
                                    <input 
                                      className="admin-input" 
                                      placeholder="e.g. FRONTEND PLATFORMS (REACT / NEXT)"
                                      value={name}
                                      onChange={e => {
                                         const newStack = [...(cardToEdit.technology_stack || [])];
                                         newStack[i] = { ...(tech || {}), name: e.target.value, svg };
                                         setCardToEdit({...cardToEdit, technology_stack: newStack});
                                      }}
                                    />
                                    <div className="flex gap-4 items-start">
                                       <textarea 
                                          className="admin-input flex-1 min-h-[80px] font-mono text-xs" 
                                          placeholder='Paste tool SVG icon code here...' 
                                          value={svg} 
                                          onChange={e => {
                                             const newStack = [...(cardToEdit.technology_stack || [])];
                                             newStack[i] = { ...(tech || {}), name, svg: e.target.value };
                                             setCardToEdit({...cardToEdit, technology_stack: newStack});
                                          }} 
                                       />
                                       {svg && (
                                          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg border border-white/10 text-white shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
                                       )}
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                                       <input 
                                          type="checkbox"
                                          className="accent-deep-purple"
                                          checked={tech?.is_special || false}
                                          onChange={e => {
                                             const newStack = [...(cardToEdit.technology_stack || [])];
                                             newStack[i] = { ...(tech || {}), name, svg, is_special: e.target.checked };
                                             setCardToEdit({...cardToEdit, technology_stack: newStack});
                                          }}
                                       />
                                       <span className="text-xs font-medium text-white/70">Special (Feature on Homepage)</span>
                                    </label>
                                 </div>
                                 <button type="button" onClick={() => {
                                    const newStack = [...(cardToEdit.technology_stack || [])];
                                    newStack.splice(i, 1);
                                    setCardToEdit({...cardToEdit, technology_stack: newStack});
                                 }} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors mt-1">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           )})}
                           <button type="button" onClick={() => {
                              setCardToEdit({...cardToEdit, technology_stack: [...(cardToEdit.technology_stack || []), {name: '', svg: ''}]});
                           }} className="admin-button self-start mt-2 px-3 py-1.5 text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add Tool
                           </button>
                        </div>
                     </div>
                  </div>
                  {/* Capabilities Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">Capabilities / Engineered Excellence</label>
                        <p className="text-xs text-white/40 mb-2">Each capability added here will appear in the horizontally scrolling section on the service detail page.</p>
                        <div className="flex flex-col gap-4">
                           {(cardToEdit.capabilities || []).map((cap: any, i: number) => {
                              return (
                              <div key={i} className="flex gap-4 items-start border border-white/10 p-4 rounded-xl bg-white/5">
                                 <div className="w-8 h-10 flex items-center justify-center font-mono text-sm text-white/40">{(i+1).toString().padStart(2, '0')}</div>
                                 <div className="flex flex-col flex-1 gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <input 
                                        className="admin-input" 
                                        placeholder="Title (e.g. Predictive Analytics)"
                                        value={cap?.title || ''}
                                        onChange={e => {
                                           const newCaps = [...(cardToEdit.capabilities || [])];
                                           newCaps[i] = { ...(cap || {}), title: e.target.value };
                                           setCardToEdit({...cardToEdit, capabilities: newCaps});
                                        }}
                                      />
                                      <div className="grid grid-cols-2 gap-2">
                                        <input 
                                          className="admin-input" 
                                          placeholder="Metric (e.g. 340%)"
                                          value={cap?.metric || ''}
                                          onChange={e => {
                                             const newCaps = [...(cardToEdit.capabilities || [])];
                                             newCaps[i] = { ...(cap || {}), metric: e.target.value };
                                             setCardToEdit({...cardToEdit, capabilities: newCaps});
                                          }}
                                        />
                                        <input 
                                          className="admin-input" 
                                          placeholder="Label (e.g. AVG ROI)"
                                          value={cap?.metricLabel || ''}
                                          onChange={e => {
                                             const newCaps = [...(cardToEdit.capabilities || [])];
                                             newCaps[i] = { ...(cap || {}), metricLabel: e.target.value };
                                             setCardToEdit({...cardToEdit, capabilities: newCaps});
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <textarea 
                                      className="admin-input flex-1 min-h-[60px] text-sm" 
                                      placeholder='Description (e.g. Deploy machine learning models...)' 
                                      value={cap?.desc || ''}
                                      onChange={e => {
                                         const newCaps = [...(cardToEdit.capabilities || [])];
                                         newCaps[i] = { ...(cap || {}), desc: e.target.value };
                                         setCardToEdit({...cardToEdit, capabilities: newCaps});
                                      }} 
                                    />
                                 </div>
                                 <button type="button" onClick={() => {
                                    const newCaps = [...(cardToEdit.capabilities || [])];
                                    newCaps.splice(i, 1);
                                    setCardToEdit({...cardToEdit, capabilities: newCaps});
                                 }} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors mt-1">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           )})}
                           <button type="button" onClick={() => {
                              setCardToEdit({...cardToEdit, capabilities: [...(cardToEdit.capabilities || []), {title: '', desc: '', metric: '', metricLabel: ''}]});
                           }} className="admin-button self-start mt-2 px-3 py-1.5 text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add Capability
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* FAQs Group */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white/80">Service FAQs</label>
                        <p className="text-xs text-white/40 mb-2">Frequently asked questions specific to this service.</p>
                        <div className="flex flex-col gap-4">
                           {(cardToEdit.faqs || []).map((faq: any, i: number) => {
                              return (
                              <div key={i} className="flex gap-4 items-start border border-white/10 p-4 rounded-xl bg-white/5">
                                 <div className="w-8 h-10 flex items-center justify-center font-mono text-sm text-white/40">{(i+1).toString().padStart(2, '0')}</div>
                                 <div className="flex flex-col flex-1 gap-3">
                                    <input 
                                      className="admin-input" 
                                      placeholder="Question"
                                      value={faq?.question || ''}
                                      onChange={e => {
                                         const newFaqs = [...(cardToEdit.faqs || [])];
                                         newFaqs[i] = { ...(faq || {}), question: e.target.value };
                                         setCardToEdit({...cardToEdit, faqs: newFaqs});
                                      }}
                                    />
                                    <textarea 
                                      className="admin-input flex-1 min-h-[60px] text-sm" 
                                      placeholder='Answer' 
                                      value={faq?.answer || ''}
                                      onChange={e => {
                                         const newFaqs = [...(cardToEdit.faqs || [])];
                                         newFaqs[i] = { ...(faq || {}), answer: e.target.value };
                                         setCardToEdit({...cardToEdit, faqs: newFaqs});
                                      }} 
                                    />
                                 </div>
                                 <button type="button" onClick={() => {
                                    const newFaqs = [...(cardToEdit.faqs || [])];
                                    newFaqs.splice(i, 1);
                                    setCardToEdit({...cardToEdit, faqs: newFaqs});
                                 }} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors mt-1">
                                    <Trash2 className="w-5 h-5" />
                                 </button>
                              </div>
                           )})}
                           <button type="button" onClick={() => {
                              setCardToEdit({...cardToEdit, faqs: [...(cardToEdit.faqs || []), {question: '', answer: ''}]});
                           }} className="admin-button self-start mt-2 px-3 py-1.5 text-sm flex items-center gap-2">
                              <Plus className="w-4 h-4" /> Add FAQ
                           </button>
                        </div>
                     </div>
                  </div>


                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-white/5 rounded-xl border border-white/10">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 accent-deep-purple"
                       checked={cardToEdit.is_visible} 
                       onChange={e => setCardToEdit({...cardToEdit, is_visible: e.target.checked})} 
                     />
                     <span className="font-medium">Visible to Public</span>
                  </label>

                  <div className="sticky bottom-0 bg-[#0f0f13] pt-4 border-t border-white/10 flex justify-end gap-4 mt-auto z-10">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Card</button>
                  </div>
               </form>

            </div>
         </div>
      )}
    </div>
  )
}
