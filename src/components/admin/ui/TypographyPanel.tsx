'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Type } from 'lucide-react'
import { FontSelector } from './FontSelector'
import { ColorPicker } from './ColorPicker'

interface TypographyPanelProps {
  label: string
  values: {
    fontFamily?: string
    fontSize?: string
    fontWeight?: string
    letterSpacing?: string
    lineHeight?: string
    color?: string
  }
  onChange: (key: string, value: string) => void
  disabled?: boolean
  hideColor?: boolean
}

export function TypographyPanel({ label, values, onChange, disabled, hideColor }: TypographyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`border border-white/10 rounded-lg overflow-hidden ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div 
        className="flex items-center justify-between p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-white/50" />
          <span className="font-medium text-sm">{label} Typography</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
      </div>
      
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20">
          {!hideColor && (
            <div className="sm:col-span-2">
              <ColorPicker 
                label="Color" 
                value={values.color || ''} 
                onChange={(v) => onChange('color', v)} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
