'use client'

import { useState } from 'react'

interface FontSelectorProps {
  label?: string
  value: string
  onChange: (font: string) => void
  disabled?: boolean
}

// Curated list of fonts for Pixenox platform
const FONTS = [
  'Inter',
  'Outfit',
  'Roboto',
  'Playfair Display',
  'Montserrat',
  'Lato',
  'Poppins',
  'Oswald',
  'Raleway',
  'Work Sans',
  'Space Grotesk',
  'Syne',
  'DM Sans',
  'Manrope',
  'Clash Display', // Often used via CDN/local
]

export function FontSelector({ label, value, onChange, disabled }: FontSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredFonts = FONTS.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
  
  return (
    <div className="flex flex-col gap-1.5 relative">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      <div 
        className={`admin-input cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontFamily: value || 'inherit' }}>{value || 'Select a font'}</span>
        <span className="opacity-50">▼</span>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-[100%] left-0 w-full mt-2 z-50 bg-rich-black border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden flex flex-col max-h-64">
           <div className="p-2 border-b border-white/10">
              <input 
                autoFocus
                className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                placeholder="Search fonts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex-1 overflow-y-auto">
             {filteredFonts.map(font => (
                <div 
                  key={font} 
                  className={`p-2.5 text-sm cursor-pointer hover:bg-white/5 ${font === value ? 'bg-deep-purple/20 text-deep-purple font-semibold' : 'text-white'}`}
                  style={{ fontFamily: font }}
                  onClick={() => {
                     onChange(font)
                     setIsOpen(false)
                     setSearchTerm('')
                  }}
                >
                  {font}
                </div>
             ))}
             {filteredFonts.length === 0 && (
                <div className="p-3 text-center text-sm opacity-50">No fonts found</div>
             )}
           </div>
        </div>
      )}
      
      {isOpen && (
         <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}/>
      )}
    </div>
  )
}
