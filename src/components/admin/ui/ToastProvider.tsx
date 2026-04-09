'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className="flex items-center gap-3 p-4 bg-rich-black border border-white/10 rounded-lg shadow-xl min-w-[300px] animate-in slide-in-from-bottom-5"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {t.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-deep-purple" />}
            <p className="text-sm font-medium text-white flex-1">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context.toast
}
