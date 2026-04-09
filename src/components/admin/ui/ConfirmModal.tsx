'use client'

import { useState, useEffect } from 'react'

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  description = "This action cannot be undone." 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
}) {
  const [isPending, setIsPending] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsPending(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
       <div className="bg-rich-black border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/70 mb-6">{description}</p>
          
          <div className="flex justify-end gap-3">
             <button 
               onClick={onClose} 
               disabled={isPending}
               className="px-4 py-2 rounded-lg text-white hover:bg-white/10 font-medium transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleConfirm}
               disabled={isPending}
               className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
             >
               {isPending ? 'Confirming...' : 'Yes, continue'}
             </button>
          </div>
       </div>
    </div>
  )
}
