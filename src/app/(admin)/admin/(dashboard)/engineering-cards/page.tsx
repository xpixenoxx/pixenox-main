'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { Edit, Trash2, Plus, X } from 'lucide-react'

export default function EngineeringCardsAdminPage() {
  const [pages, setPages] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [pageToEdit, setPageToEdit] = useState<any>(null)
  
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('engineering_card_pages').select('*').order('created_at', { ascending: false })
    if (data) setPages(data)
    setDidLoad(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('engineering_card_pages').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Page deleted', 'success')
      setPages(pages.filter(p => p.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
    setDeleteData({ id: null })
  }

  const openEdit = (page: any) => {
    setPageToEdit({ ...page })
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setPageToEdit({
       service_slug: '',
       card_slug: '',
       hero_title: 'New Title',
       hero_description: '',
       hero_image_url: '',
       section2_name: 'Features',
       section2_description: '',
       section2_cards: [],
       section3_name: 'Key Functions',
       section3_description: '',
       section3_cards: [],
       section4_name: 'Key Outcomes',
       section4_description: '',
       section4_cards: [],
       section5_name: 'Current Modernization Trends',
       section5_description: '',
       section5_blog_slugs: []
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...pageToEdit }
       delete payload.id 
       
       let res;
       if (modalMode === 'create') {
          res = await supabase.from('engineering_card_pages').insert([payload]).select().single()
       } else {
          res = await supabase.from('engineering_card_pages').update(payload).eq('id', pageToEdit.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Page ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
       setIsModalOpen(false)
       fetchData()
     } catch (err: any) {
       toast(err.message || 'Validation error', 'error')
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="glass-card">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Engineering Card Detail Pages</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm">
               <Plus className="w-4 h-4" /> Create Page
            </button>
         </div>

         <div className="flex flex-col gap-2">
            {pages.map(page => (
               <div key={page.id} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg">
                  <div className="w-16 h-12 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden">
                    {page.hero_image_url ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={page.hero_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-xs text-white/30 truncate px-1">IMG</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate text-white">{page.hero_title || 'Untitled'}</h4>
                    <p className="text-sm opacity-60 truncate">/engineering/{page.service_slug}/{page.card_slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(page)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteData({ id: page.id })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            ))}
            {pages.length === 0 && (
               <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                  No engineering card detail pages found.
               </div>
            )}
         </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteData.id}
        onClose={() => setDeleteData({ id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Card Page?"
        description="This will permanently delete this nested detail page."
      />

      {isModalOpen && pageToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Create Card Page' : 'Edit Card Page'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-8 max-h-[75vh] overflow-y-auto">
                  
                  {/* Routing Identity */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Parent Service Slug</label>
                        <input className="admin-input" placeholder="e.g. custom-software" value={pageToEdit.service_slug || ''} onChange={e => setPageToEdit({...pageToEdit, service_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Card Detail Slug</label>
                        <input className="admin-input" placeholder="e.g. predictive-analytics" value={pageToEdit.card_slug || ''} onChange={e => setPageToEdit({...pageToEdit, card_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
                     </div>
                  </div>

                  {/* 1. Hero Section */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white text-lg">1. Hero Section</h3>
                     <FileUploadZone 
                        label="Hero Image"
                        bucket="service-images"
                        value={pageToEdit.hero_image_url}
                        onUploadSuccess={url => setPageToEdit({...pageToEdit, hero_image_url: url})}
                     />
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Hero Title (H1)</label>
                        <input className="admin-input" value={pageToEdit.hero_title || ''} onChange={e => setPageToEdit({...pageToEdit, hero_title: e.target.value})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Hero Description</label>
                        <textarea className="admin-input min-h-[80px]" value={pageToEdit.hero_description || ''} onChange={e => setPageToEdit({...pageToEdit, hero_description: e.target.value})} />
                     </div>
                  </div>

                  {/* 2. Section 2 */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white text-lg">2. Features Section</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Title</label>
                           <input className="admin-input" value={pageToEdit.section2_name || ''} onChange={e => setPageToEdit({...pageToEdit, section2_name: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Description</label>
                           <textarea className="admin-input min-h-[40px]" value={pageToEdit.section2_description || ''} onChange={e => setPageToEdit({...pageToEdit, section2_description: e.target.value})} />
                        </div>
                     </div>
                     
                     <label className="text-sm font-medium text-white/80 mt-2">Feature Cards (Image, Title, Description)</label>
                     <div className="flex flex-col gap-3">
                        {(pageToEdit.section2_cards || []).map((card: any, i: number) => (
                           <div key={i} className="flex gap-4 p-4 border border-white/10 bg-black/20 rounded-lg">
                              <div className="flex-1 grid grid-cols-1 gap-3">
                                 <div className="flex flex-col gap-2">
                                    <FileUploadZone 
                                       label="Upload Feature Image"
                                       bucket="service-images"
                                       value={card.image_url}
                                       onUploadSuccess={url => {
                                          const n = [...pageToEdit.section2_cards]; n[i].image_url = url; setPageToEdit({...pageToEdit, section2_cards: n});
                                       }}
                                    />
                                    <input className="admin-input" placeholder="Or enter Image URL manually" value={card.image_url || ''} onChange={e => {
                                       const n = [...pageToEdit.section2_cards]; n[i].image_url = e.target.value; setPageToEdit({...pageToEdit, section2_cards: n});
                                    }} />
                                 </div>
                                 <input className="admin-input font-bold" placeholder="Card Title" value={card.title || ''} onChange={e => {
                                    const n = [...pageToEdit.section2_cards]; n[i].title = e.target.value; setPageToEdit({...pageToEdit, section2_cards: n});
                                 }} />
                                 <textarea className="admin-input min-h-[60px]" placeholder="Card Description" value={card.description || ''} onChange={e => {
                                    const n = [...pageToEdit.section2_cards]; n[i].description = e.target.value; setPageToEdit({...pageToEdit, section2_cards: n});
                                 }} />
                              </div>
                              <button type="button" onClick={() => {
                                 const n = [...pageToEdit.section2_cards]; n.splice(i, 1); setPageToEdit({...pageToEdit, section2_cards: n});
                              }} className="p-2 bg-red-500/10 text-red-400 rounded-lg self-start">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        ))}
                        <button type="button" onClick={() => {
                           setPageToEdit({...pageToEdit, section2_cards: [...(pageToEdit.section2_cards||[]), {image_url:'', title:'', description:''}]})
                        }} className="admin-button self-start px-3 py-1.5 text-sm">Add Feature Card</button>
                     </div>
                  </div>

                  {/* 3. Section 3: Key Functions */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white text-lg">3. Key Functions Section</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Title</label>
                           <input className="admin-input" value={pageToEdit.section3_name || ''} onChange={e => setPageToEdit({...pageToEdit, section3_name: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Description</label>
                           <textarea className="admin-input min-h-[40px]" value={pageToEdit.section3_description || ''} onChange={e => setPageToEdit({...pageToEdit, section3_description: e.target.value})} />
                        </div>
                     </div>
                     
                     <label className="text-sm font-medium text-white/80 mt-2">Cards (Topic, Description, Learn More URL)</label>
                     <div className="flex flex-col gap-3">
                        {(pageToEdit.section3_cards || []).map((card: any, i: number) => (
                           <div key={i} className="flex gap-4 p-4 border border-white/10 bg-black/20 rounded-lg">
                              <div className="flex-1 grid grid-cols-1 gap-3">
                                 <div className="flex flex-col gap-2">
                                    <FileUploadZone 
                                       label="Upload Icon/Image"
                                       bucket="service-images"
                                       value={card.image_url}
                                       onUploadSuccess={url => {
                                          const n = [...pageToEdit.section3_cards]; n[i].image_url = url; setPageToEdit({...pageToEdit, section3_cards: n});
                                       }}
                                    />
                                    <input className="admin-input" placeholder="Or enter Image URL manually" value={card.image_url || ''} onChange={e => {
                                       const n = [...pageToEdit.section3_cards]; n[i].image_url = e.target.value; setPageToEdit({...pageToEdit, section3_cards: n});
                                    }} />
                                 </div>
                                 <input className="admin-input font-bold" placeholder="Topic Name" value={card.topic || ''} onChange={e => {
                                    const n = [...pageToEdit.section3_cards]; n[i].topic = e.target.value; setPageToEdit({...pageToEdit, section3_cards: n});
                                 }} />
                                 <textarea className="admin-input min-h-[60px]" placeholder="Description" value={card.description || ''} onChange={e => {
                                    const n = [...pageToEdit.section3_cards]; n[i].description = e.target.value; setPageToEdit({...pageToEdit, section3_cards: n});
                                 }} />
                                 <input className="admin-input" placeholder="Learn More URL (optional)" value={card.link_url || ''} onChange={e => {
                                    const n = [...pageToEdit.section3_cards]; n[i].link_url = e.target.value; setPageToEdit({...pageToEdit, section3_cards: n});
                                 }} />
                              </div>
                              <button type="button" onClick={() => {
                                 const n = [...pageToEdit.section3_cards]; n.splice(i, 1); setPageToEdit({...pageToEdit, section3_cards: n});
                              }} className="p-2 bg-red-500/10 text-red-400 rounded-lg self-start">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        ))}
                        <button type="button" onClick={() => {
                           setPageToEdit({...pageToEdit, section3_cards: [...(pageToEdit.section3_cards||[]), {image_url:'', topic:'', description:'', link_url:''}]})
                        }} className="admin-button self-start px-3 py-1.5 text-sm">Add Function Card</button>
                     </div>
                  </div>

                  {/* 4. Section 4: Key Outcomes */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white text-lg">4. Key Outcomes Section</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Title</label>
                           <input className="admin-input" value={pageToEdit.section4_name || ''} onChange={e => setPageToEdit({...pageToEdit, section4_name: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Description</label>
                           <textarea className="admin-input min-h-[40px]" value={pageToEdit.section4_description || ''} onChange={e => setPageToEdit({...pageToEdit, section4_description: e.target.value})} />
                        </div>
                     </div>
                     
                     <label className="text-sm font-medium text-white/80 mt-2">Cards (Logo, Title, Description)</label>
                     <div className="flex flex-col gap-3">
                        {(pageToEdit.section4_cards || []).map((card: any, i: number) => (
                           <div key={i} className="flex gap-4 p-4 border border-white/10 bg-black/20 rounded-lg">
                              <div className="flex-1 grid grid-cols-1 gap-3">
                                 <div className="flex flex-col gap-2">
                                    <FileUploadZone 
                                       label="Upload Logo"
                                       bucket="service-images"
                                       value={card.logo_url}
                                       onUploadSuccess={url => {
                                          const n = [...pageToEdit.section4_cards]; n[i].logo_url = url; setPageToEdit({...pageToEdit, section4_cards: n});
                                       }}
                                    />
                                    <input className="admin-input" placeholder="Or enter Logo URL manually" value={card.logo_url || ''} onChange={e => {
                                       const n = [...pageToEdit.section4_cards]; n[i].logo_url = e.target.value; setPageToEdit({...pageToEdit, section4_cards: n});
                                    }} />
                                 </div>
                                 <input className="admin-input font-bold" placeholder="Card Title" value={card.title || ''} onChange={e => {
                                    const n = [...pageToEdit.section4_cards]; n[i].title = e.target.value; setPageToEdit({...pageToEdit, section4_cards: n});
                                 }} />
                                 <textarea className="admin-input min-h-[60px]" placeholder="Description" value={card.description || ''} onChange={e => {
                                    const n = [...pageToEdit.section4_cards]; n[i].description = e.target.value; setPageToEdit({...pageToEdit, section4_cards: n});
                                 }} />
                              </div>
                              <button type="button" onClick={() => {
                                 const n = [...pageToEdit.section4_cards]; n.splice(i, 1); setPageToEdit({...pageToEdit, section4_cards: n});
                              }} className="p-2 bg-red-500/10 text-red-400 rounded-lg self-start">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        ))}
                        <button type="button" onClick={() => {
                           setPageToEdit({...pageToEdit, section4_cards: [...(pageToEdit.section4_cards||[]), {logo_url:'', title:'', description:''}]})
                        }} className="admin-button self-start px-3 py-1.5 text-sm">Add Outcome Card</button>
                     </div>
                  </div>

                  {/* 5. Section 5: Trends */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-4">
                     <h3 className="font-bold text-white text-lg">5. Modernization Trends Section</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Title</label>
                           <input className="admin-input" value={pageToEdit.section5_name || ''} onChange={e => setPageToEdit({...pageToEdit, section5_name: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-white/80">Section Description</label>
                           <textarea className="admin-input min-h-[40px]" value={pageToEdit.section5_description || ''} onChange={e => setPageToEdit({...pageToEdit, section5_description: e.target.value})} />
                        </div>
                     </div>
                     <label className="text-sm font-medium text-white/80 mt-2">Selected Blog Slugs</label>
                     <div className="flex flex-col gap-2">
                        {(pageToEdit.section5_blog_slugs || []).map((slug: string, i: number) => (
                           <div key={i} className="flex gap-2">
                              <input className="admin-input flex-1" placeholder="e.g. ai-trends" value={slug} onChange={e => {
                                 const n = [...(pageToEdit.section5_blog_slugs || [])]; n[i] = e.target.value; setPageToEdit({...pageToEdit, section5_blog_slugs: n});
                              }} />
                              <button type="button" onClick={() => {
                                 const n = [...(pageToEdit.section5_blog_slugs || [])]; n.splice(i, 1); setPageToEdit({...pageToEdit, section5_blog_slugs: n});
                              }} className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        ))}
                        <button type="button" onClick={() => {
                           setPageToEdit({...pageToEdit, section5_blog_slugs: [...(pageToEdit.section5_blog_slugs || []), '']})
                        }} className="admin-button self-start px-3 py-1.5 text-sm">Add Blog Slug</button>
                     </div>
                  </div>

                  <div className="sticky bottom-0 bg-[#0f0f13] pt-4 border-t border-white/10 flex justify-end gap-4 mt-auto z-10 pb-4">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg text-white font-medium hover:bg-white/10 transition">Cancel</button>
                     <button type="submit" className="admin-button">Save Page Configuration</button>
                  </div>
               </form>

            </div>
         </div>
      )}
    </div>
  )
}
