'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { Inbox, CheckCircle, Mail, Phone, Calendar, Trash2 } from 'lucide-react'

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [didLoad, setDidLoad] = useState(false)
  const [selectedSub, setSelectedSub] = useState<any>(null)
  
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    fetchData()

    // Real-time synchronization exactly like the TopBar
    const channel = supabase.channel('submissions_inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_submissions' }, (payload) => {
        setSubmissions(prev => [payload.new, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contact_submissions' }, (payload) => {
        setSubmissions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
        if (selectedSub && selectedSub.id === payload.new.id) {
           setSelectedSub(payload.new)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, selectedSub])

  const fetchData = async () => {
    const { data, error } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false })
    if (data) setSubmissions(data)
    setDidLoad(true)
  }

  const markRead = async (id: string, is_read: boolean) => {
    // Optimistic
    setSubmissions(submissions.map(s => s.id === id ? { ...s, is_read } : s))
    if (selectedSub && selectedSub.id === id) {
       setSelectedSub({ ...selectedSub, is_read })
    }

    try {
      await supabase.from('contact_submissions').update({ is_read }).eq('id', id)
    } catch(e) {
      toast('Failed to update status', 'error')
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete submission?')) return;
    try {
       await supabase.from('contact_submissions').delete().eq('id', id)
       setSubmissions(submissions.filter(s => s.id !== id))
       if (selectedSub?.id === id) setSelectedSub(null)
       toast('Submission deleted', 'success')
    } catch(e) {
       toast('Failed to delete', 'error')
    }
  }

  const selectMessage = (sub: any) => {
     setSelectedSub(sub)
     if (!sub.is_read) {
        markRead(sub.id, true)
     }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-[80vh] rounded-xl" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-140px)] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Inbox List */}
      <div className="border-r border-white/10 flex flex-col bg-black/20 h-full overflow-hidden">
         <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
            <h3 className="font-bold flex items-center gap-2">
               <Inbox className="w-5 h-5 text-deep-purple" />
               Inbox
            </h3>
            <span className="badge">{submissions.filter(s => !s.is_read).length} New</span>
         </div>
         
         <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {submissions.map(sub => (
              <button 
                key={sub.id}
                onClick={() => selectMessage(sub)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1 relative overflow-hidden group
                  ${selectedSub?.id === sub.id ? 'bg-deep-purple/20 ring-1 ring-deep-purple' : 'hover:bg-white/5'}
                `}
              >
                {!sub.is_read && (
                  <div className="absolute top-0 right-0 w-3 h-3 m-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
                <div className="flex items-center justify-between">
                   <h4 className={`font-medium ${!sub.is_read ? 'text-white font-bold' : 'text-white/80'}`}>{sub.name}</h4>
                </div>
                <div className="text-xs text-white/50 mb-1">{new Date(sub.submitted_at).toLocaleDateString()}</div>
                <p className="text-sm opacity-60 line-clamp-1">{sub.message}</p>
              </button>
            ))}

            {submissions.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full opacity-50 p-6 text-center text-sm gap-2 mt-20">
                  <Inbox className="w-8 h-8 opacity-50" />
                  No messages in your database inbox.
               </div>
            )}
         </div>
      </div>

      {/* Reader Pane */}
      <div className="flex flex-col h-full bg-[#0a0a0f]">
         {selectedSub ? (
            <>
               <div className="p-6 border-b border-white/10 flex items-start justify-between shrink-0">
                  <div className="flex flex-col gap-2">
                     <h2 className="text-2xl font-bold text-white">{selectedSub.name}</h2>
                     <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <a href={`mailto:${selectedSub.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                           <Mail className="w-4 h-4" /> {selectedSub.email}
                        </a>
                        {selectedSub.mobile && (
                           <a href={`tel:${selectedSub.mobile}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                              <Phone className="w-4 h-4" /> {selectedSub.mobile}
                           </a>
                        )}
                        <span className="flex items-center gap-1.5">
                           <Calendar className="w-4 h-4" /> {new Date(selectedSub.submitted_at).toLocaleString()}
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => markRead(selectedSub.id, !selectedSub.is_read)}
                       className={`px-3 py-1.5 rounded text-sm font-medium border flex items-center gap-1.5 transition-colors
                          ${selectedSub.is_read ? 'border-white/10 text-white/60 hover:bg-white/10 bg-transparent' : 'bg-green-500/20 text-green-400 border-green-500/30'}
                       `}
                     >
                       <CheckCircle className="w-4 h-4" /> {selectedSub.is_read ? 'Mark Unread' : 'Mark as Read'}
                     </button>
                     <button 
                       onClick={() => handleDelete(selectedSub.id)}
                       className="p-1.5 rounded border border-white/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <div className="p-6 overflow-y-auto flex-1">
                  
                  {selectedSub.services_interested && selectedSub.services_interested.length > 0 && (
                     <div className="mb-8">
                        <h4 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-widest">Services Interested</h4>
                        <div className="flex flex-wrap gap-2">
                           {selectedSub.services_interested.map((s:string) => (
                             <span key={s} className="px-3 py-1 bg-deep-purple/20 text-deep-purple border border-deep-purple/30 rounded-full text-sm font-medium">
                               {s}
                             </span>
                           ))}
                        </div>
                     </div>
                  )}

                  <div>
                     <h4 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-widest">Message Payload</h4>
                     <p className="text-lg leading-relaxed whitespace-pre-wrap text-white/90 p-6 bg-white/5 rounded-xl border border-white/5 font-serif">
                        {selectedSub.message}
                     </p>
                  </div>
               </div>
            </>
         ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center gap-4">
               <Mail className="w-16 h-16 opacity-20" />
               <p className="text-xl font-medium">Select a submission to read.</p>
            </div>
         )}
      </div>

    </div>
  )
}
