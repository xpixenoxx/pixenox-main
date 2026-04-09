'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'
import { FontSelector } from '@/components/admin/ui/FontSelector'

const DEFAULT_THEME = {
  bg_primary: '#0a0a0f',
  bg_secondary: '#111116',
  accent_primary: '#4a0e8f',
  accent_secondary: '#6b21d4',
  text_primary: '#ffffff',
  text_secondary: '#a1a1aa',
  accent_glow: '#4a0e8f80',
  glass_bg: '#ffffff0a',
  border_color: '#ffffff1a',
  font_heading: 'Outfit',
  font_body: 'Inter',
  font_mono: 'JetBrains Mono',
  font_size_base: '16px',
  font_weight_heading: '800',
  letter_spacing_heading: '-0.02em',
  line_height_body: '1.6',
  btn_bg: '#4a0e8f',
  btn_hover_bg: '#6b21d4',
  btn_text_color: '#ffffff',
  btn_font_family: 'Inter',
  btn_font_size: '1rem',
  btn_font_weight: '600',
  btn_letter_spacing: '0.02em',
  btn_border_radius: '8px'
}

export default function ThemePage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'button'>('colors')
  const [formData, setFormData] = useState<Record<string, string>>(DEFAULT_THEME)
  const [didLoad, setDidLoad] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    const loadTheme = async () => {
      const { data, error } = await supabase.from('theme_settings').select('*')
      if (data && data.length > 0) {
        const _theme: Record<string, string> = { ...DEFAULT_THEME }
        data.forEach(item => _theme[item.key] = item.value)
        setFormData(_theme)
      }
      setDidLoad(true)
    }
    loadTheme()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Upsert batch
      const itemsToUpsert = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase.from('theme_settings').upsert(itemsToUpsert, { onConflict: 'key' })
      if (error) throw error

      toast('Theme settings saved successfully!', 'success')
    } catch (err: any) {
      console.error(err)
      toast(err.message || 'Error saving theme', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSave} className="glass-card flex flex-col">
          <div className="flex gap-4 border-b border-white/10 mb-6">
             <button 
               type="button" 
               className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'colors' ? 'border-deep-purple text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
               onClick={() => setActiveTab('colors')}
             >
               Colors
             </button>
             <button 
               type="button" 
               className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'typography' ? 'border-deep-purple text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
               onClick={() => setActiveTab('typography')}
             >
               Typography
             </button>
             <button 
               type="button" 
               className={`pb-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'button' ? 'border-deep-purple text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}
               onClick={() => setActiveTab('button')}
             >
               Buttons
             </button>
          </div>

          {activeTab === 'colors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { key: 'bg_primary', label: 'Background Primary' },
                { key: 'bg_secondary', label: 'Background Secondary' },
                { key: 'accent_primary', label: 'Accent Primary' },
                { key: 'accent_secondary', label: 'Accent Secondary' },
                { key: 'text_primary', label: 'Text Primary' },
                { key: 'text_secondary', label: 'Text Secondary' },
                { key: 'border_color', label: 'Border Color' },
              ].map(color => (
                 <ColorPicker 
                   key={color.key}
                   label={color.label}
                   value={formData[color.key]}
                   onChange={(v) => handleChange(color.key, v)}
                 />
              ))}
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FontSelector label="Heading Font" value={formData.font_heading} onChange={v => handleChange('font_heading', v)} />
              <FontSelector label="Body Font" value={formData.font_body} onChange={v => handleChange('font_body', v)} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Base Font Size</label>
                <input className="admin-input" value={formData.font_size_base} onChange={e => handleChange('font_size_base', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Heading Weight</label>
                <input className="admin-input" value={formData.font_weight_heading} onChange={e => handleChange('font_weight_heading', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Heading Letter Spacing</label>
                <input className="admin-input" value={formData.letter_spacing_heading} onChange={e => handleChange('letter_spacing_heading', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white/80">Body Line Height</label>
                <input className="admin-input" value={formData.line_height_body} onChange={e => handleChange('line_height_body', e.target.value)} />
              </div>
            </div>
          )}

          {activeTab === 'button' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <ColorPicker label="Background Color" value={formData.btn_bg} onChange={v => handleChange('btn_bg', v)} />
               <ColorPicker label="Hover BG Color" value={formData.btn_hover_bg} onChange={v => handleChange('btn_hover_bg', v)} />
               <ColorPicker label="Text Color" value={formData.btn_text_color} onChange={v => handleChange('btn_text_color', v)} />
               <FontSelector label="Font Family" value={formData.btn_font_family} onChange={v => handleChange('btn_font_family', v)} />
               
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Font Size</label>
                 <input className="admin-input" value={formData.btn_font_size} onChange={e => handleChange('btn_font_size', e.target.value)} />
               </div>
               
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Font Weight</label>
                 <input className="admin-input" value={formData.btn_font_weight} onChange={e => handleChange('btn_font_weight', e.target.value)} />
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Border Radius</label>
                 <select className="admin-input appearance-none" value={formData.btn_border_radius} onChange={e => handleChange('btn_border_radius', e.target.value)}>
                   <option value="999px">Pill (999px)</option>
                   <option value="12px">Rounded (12px)</option>
                   <option value="8px">Soft (8px)</option>
                   <option value="0px">Sharp (0px)</option>
                 </select>
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Letter Spacing</label>
                 <input className="admin-input" value={formData.btn_letter_spacing} onChange={e => handleChange('btn_letter_spacing', e.target.value)} />
               </div>
            </div>
          )}

          <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
            <button type="submit" disabled={isSaving} className="admin-button">
              {isSaving ? 'Saving...' : 'Save Theme Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card sticky top-24 h-fit">
        <h3 className="text-lg font-bold mb-4 opacity-70">Live Preview</h3>
        <div 
          className="border border-white/10 rounded-lg p-6 flex flex-col gap-4"
          style={{ 
            backgroundColor: formData.bg_primary,
            color: formData.text_primary,
            fontFamily: formData.font_body
          }}
        >
           <h1 
             style={{
               fontFamily: formData.font_heading,
               fontWeight: formData.font_weight_heading,
               letterSpacing: formData.letter_spacing_heading
             }}
             className="text-2xl"
           >
             Heading Example
           </h1>
           
           <p style={{ color: formData.text_secondary, lineHeight: formData.line_height_body }}>
             This is a demonstration of how your typography and colors will look together on the actual frontend platform.
           </p>

           <button 
             className="mt-4 px-6 py-3 transition-colors max-w-fit"
             style={{
               backgroundColor: formData.btn_bg,
               color: formData.btn_text_color,
               fontFamily: formData.btn_font_family,
               fontSize: formData.btn_font_size,
               fontWeight: formData.btn_font_weight,
               letterSpacing: formData.btn_letter_spacing,
               borderRadius: formData.btn_border_radius
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = formData.btn_hover_bg}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.btn_bg}
           >
             Primary Action
           </button>
        </div>
      </div>
    </div>
  )
}
