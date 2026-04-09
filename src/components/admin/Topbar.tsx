'use client'

import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Topbar({ title = "Dashboard" }: { title?: string }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
      
      if (count !== null) setUnreadCount(count)
    }

    fetchUnread()

    // Realtime subscription for new submissions
    const channel = supabase.channel('submissions_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'contact_submissions' 
      }, (payload) => {
        setUnreadCount((prev) => prev + 1)
        // Request notification permission and show
        if (Notification.permission === 'granted') {
          new Notification('New Contact Submission', {
            body: `You received a new message from ${payload.new.name}.`,
          })
        }
      })
      .on('postgres_changes', {
         event: 'UPDATE',
         schema: 'public',
         table: 'contact_submissions'
      }, (payload) => {
          if (payload.new.is_read && !payload.old.is_read) {
             setUnreadCount((prev) => Math.max(0, prev - 1))
          } else if (!payload.new.is_read && payload.old.is_read) {
             setUnreadCount((prev) => prev + 1)
          }
      })
      .subscribe()

    // Ask for Notification permission on load
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <header className="admin-topbar sticky top-0">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white/70 hover:text-white transition-colors" title="Notifications">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 badge flex items-center justify-center -mt-1 -mr-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        
        <div className="w-8 h-8 rounded-full bg-deep-purple flex items-center justify-center text-sm font-bold shadow bg-deep-purple">
          A
        </div>
      </div>
    </header>
  )
}
