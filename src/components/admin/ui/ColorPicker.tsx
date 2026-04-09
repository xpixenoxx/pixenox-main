'use client'

import { HexColorPicker } from 'react-colorful'
import { useState, useRef, useEffect } from 'react'
import { Paintbrush } from 'lucide-react'

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ label, value, onChange, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="flex flex-col gap-1.5 relative">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-md border border-white/10 flex items-center justify-center relative shadow-sm overflow-hidden"
        >
          {/* Transparency grid background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPjwvc3ZnPg==')] opacity-30" />
          <div className="absolute inset-0" style={{ backgroundColor: value || 'transparent' }} />
        </button>
        <div className="relative flex-1">
          <Paintbrush className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            className="admin-input pl-9 font-mono text-sm uppercase"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div ref={popoverRef} className="absolute top-[100%] left-0 mt-2 z-50 p-3 bg-rich-black border border-white/10 rounded-lg shadow-xl shadow-black/50">
          <HexColorPicker color={value || '#000000'} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
