'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ConfirmModal } from '@/components/admin/ui/ConfirmModal'
import { Edit, Trash2, Plus, X, Briefcase, MapPin, Clock } from 'lucide-react'

export default function CareersAdminPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create'|'edit'>('create')
  const [jobToEdit, setJobToEdit] = useState<any>(null)
  
  const [deleteData, setDeleteData] = useState<{ id: string | null }>({ id: null })
  
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('careers').select('*').order('created_at', { ascending: false })
    if (data) setJobs(data)
    setDidLoad(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteData.id) return
    try {
      const { error } = await supabase.from('careers').delete().eq('id', deleteData.id)
      if (error) throw error
      toast('Job deleted', 'success')
      setJobs(jobs.filter(j => j.id !== deleteData.id))
    } catch (e:any) {
      toast('Error deleting: ' + e.message, 'error')
    }
    setDeleteData({ id: null })
  }

  const openEdit = (job: any) => {
    setJobToEdit({ ...job, requirementsText: job.requirements?.join('\n') || '' })
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openCreate = () => {
    setJobToEdit({
       title: '',
       department: 'Engineering',
       location: 'Remote — Global',
       type: 'Full-Time',
       description: '',
       requirementsText: '',
       is_active: true
    })
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleModalSave = async (e: React.FormEvent) => {
     e.preventDefault()
     try {
       const payload = { ...jobToEdit }
       delete payload.requirementsText
       
       // Convert requirements text to array
       if (jobToEdit.requirementsText) {
         payload.requirements = jobToEdit.requirementsText.split('\n').map((r: string) => r.trim()).filter(Boolean)
       } else {
         payload.requirements = []
       }
       
       let res;
       if (modalMode === 'create') {
          res = await supabase.from('careers').insert([payload]).select().single()
       } else {
          const { id, created_at, ...updatePayload } = payload
          res = await supabase.from('careers').update(updatePayload).eq('id', payload.id).select().single()
       }

       if (res.error) throw res.error
       toast(`Job ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, 'success')
       
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
            <h3 className="text-xl font-bold">Open Positions</h3>
            <button onClick={openCreate} className="admin-button flex items-center gap-2 px-4 py-2 text-sm">
               <Plus className="w-4 h-4" /> Add Position
            </button>
         </div>

         <div className="flex flex-col gap-2">
            {jobs.map(job => (
               <div key={job.id} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-lg">
                  <div className="w-12 h-12 bg-black/40 rounded flex shrink-0 items-center justify-center overflow-hidden">
                    <Briefcase className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold truncate text-white">{job.title || 'Untitled'}</h4>
                      {!job.is_active && <span className="text-[10px] uppercase font-bold bg-white/10 text-white/60 px-2 py-0.5 rounded">Draft</span>}
                    </div>
                    <p className="text-sm opacity-60 truncate flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(job)} className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors hover:bg-white/10">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteData({ id: job.id })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            ))}
            {jobs.length === 0 && (
               <div className="p-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
                  No careers found.
               </div>
            )}
         </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteData.id}
        onClose={() => setDeleteData({ id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Position?"
        description="This will permanently delete this job posting."
      />

      {isModalOpen && jobToEdit && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20 pb-20">
            <div className="bg-[#0f0f13] border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl relative my-auto">
               <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f0f13] z-10 rounded-t-2xl">
                  <h2 className="text-xl font-bold">{modalMode === 'create' ? 'Add Position' : 'Edit Position'}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               
               <form onSubmit={handleModalSave} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
                  
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                     <div>
                        <p className="font-bold text-white">Active Status</p>
                        <p className="text-sm text-white/60">If inactive, this job will not appear on the public careers page.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={jobToEdit.is_active} onChange={e => setJobToEdit({...jobToEdit, is_active: e.target.checked})} />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                     </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-sm font-medium text-white/80">Job Title</label>
                        <input className="admin-input" placeholder="e.g. Senior Full-Stack Engineer" value={jobToEdit.title || ''} onChange={e => setJobToEdit({...jobToEdit, title: e.target.value})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Department</label>
                        <input className="admin-input" placeholder="e.g. Engineering" value={jobToEdit.department || ''} onChange={e => setJobToEdit({...jobToEdit, department: e.target.value})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Location</label>
                        <input className="admin-input" placeholder="e.g. Remote — Global" value={jobToEdit.location || ''} onChange={e => setJobToEdit({...jobToEdit, location: e.target.value})} required />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-white/80">Employment Type</label>
                        <select className="admin-input" value={jobToEdit.type || ''} onChange={e => setJobToEdit({...jobToEdit, type: e.target.value})} required>
                           <option value="Full-Time">Full-Time</option>
                           <option value="Part-Time">Part-Time</option>
                           <option value="Contract">Contract</option>
                           <option value="Freelance">Freelance</option>
                           <option value="Internship">Internship</option>
                        </select>
                     </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Role Description (The Role)</label>
                     <textarea className="admin-input min-h-[120px]" placeholder="Detailed role description..." value={jobToEdit.description || ''} onChange={e => setJobToEdit({...jobToEdit, description: e.target.value})} required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className="text-sm font-medium text-white/80">Requirements (One per line)</label>
                     <textarea className="admin-input min-h-[120px]" placeholder="5+ years experience&#10;React/Next.js&#10;System Design" value={jobToEdit.requirementsText || ''} onChange={e => setJobToEdit({...jobToEdit, requirementsText: e.target.value})} />
                     <p className="text-xs text-white/40 mt-1">Each line will become a bullet point.</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#0f0f13] pb-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium">
                        Cancel
                     </button>
                     <button type="submit" className="admin-button px-6 py-2">
                        Save Position
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  )
}
