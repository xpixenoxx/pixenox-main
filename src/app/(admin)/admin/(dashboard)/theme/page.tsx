'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'

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
  btn_bg: '#4a0e8f',
  btn_hover_bg: '#6b21d4',
  btn_text_color: '#ffffff',
  btn_border_radius: '8px'
}

export default function ThemePage() {
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
        <form onSubmit={handleSave} className="glass-card flex flex-col p-6">
          <div className="flex gap-4 border-b border-white/10 mb-6 pb-2">
             <h3 className="text-xl font-bold">Colors & Visuals</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { key: 'bg_primary', label: 'Background Primary' },
              { key: 'bg_secondary', label: 'Background Secondary' },
              { key: 'accent_primary', label: 'Accent Primary' },
              { key: 'accent_secondary', label: 'Accent Secondary' },
              { key: 'text_primary', label: 'Text Primary' },
              { key: 'text_secondary', label: 'Text Secondary' },
              { key: 'border_color', label: 'Border Color' },
              { key: 'btn_bg', label: 'Button BG' },
              { key: 'btn_hover_bg', label: 'Button Hover BG' },
              { key: 'btn_text_color', label: 'Button Text' },
            ].map(color => (
                <ColorPicker 
                  key={color.key}
                  label={color.label}
                  value={formData[color.key]}
                  onChange={(v) => handleChange(color.key, v)}
                />
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/80">Button Radius</label>
              <select className="admin-input appearance-none" value={formData.btn_border_radius} onChange={e => handleChange('btn_border_radius', e.target.value)}>
                <option value="999px">Pill (999px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="8px">Soft (8px)</option>
                <option value="0px">Sharp (0px)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-8 border-t border-white/10 pt-6">
            <button type="submit" disabled={isSaving} className="admin-button">
              {isSaving ? 'Saving...' : 'Save Theme Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card sticky top-24 h-fit p-6">
        <h3 className="text-lg font-bold mb-4 opacity-70">Live Preview</h3>
        <div 
          className="border border-white/10 rounded-lg p-6 flex flex-col gap-4"
          style={{ 
            backgroundColor: formData.bg_primary,
            color: formData.text_primary,
          }}
        >
           <h1 className="text-2xl font-bold">Heading Example</h1>
           
           <p style={{ color: formData.text_secondary }}>
             This is a demonstration of how your colors will look together on the actual frontend platform. Typography is now standardized.
           </p>

           <button 
             className="mt-4 px-6 py-3 transition-colors max-w-fit"
             style={{
               backgroundColor: formData.btn_bg,
               color: formData.btn_text_color,
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
