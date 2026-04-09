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
          <div className="sm:col-span-2">
            <FontSelector 
              label="Font Family" 
              value={values.fontFamily || ''} 
              onChange={(v) => onChange('fontFamily', v)} 
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Font Size</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="e.g. 1.25rem"
              value={values.fontSize || ''}
              onChange={(e) => onChange('fontSize', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Font Weight</label>
            <select 
              className="admin-input appearance-none"
              value={values.fontWeight || ''}
              onChange={(e) => onChange('fontWeight', e.target.value)}
            >
              <option value="">Default</option>
              <option value="100">100 - Thin</option>
              <option value="200">200 - Extra Light</option>
              <option value="300">300 - Light</option>
              <option value="400">400 - Normal</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - Semi Bold</option>
              <option value="700">700 - Bold</option>
              <option value="800">800 - Extra Bold</option>
              <option value="900">900 - Black</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Letter Spacing</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="e.g. -0.02em"
              value={values.letterSpacing || ''}
              onChange={(e) => onChange('letterSpacing', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Line Height</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="e.g. 1.5"
              value={values.lineHeight || ''}
              onChange={(e) => onChange('lineHeight', e.target.value)}
            />
          </div>

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
