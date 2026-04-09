'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { TypographyPanel } from '@/components/admin/ui/TypographyPanel'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { brandSchema } from '@/lib/validators/brand'

export default function BrandPage() {
  const [didLoad, setDidLoad] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  const [formData, setFormData] = useState({
    id: '',
    logo_url: '',
    company_name: 'Pixenox',
    company_name_font_family: 'Inter',
    company_name_font_size: '1.5rem',
    company_name_font_weight: '700',
    company_name_letter_spacing: '-0.01em',
    company_name_color: '#ffffff',
    favicon_url: ''
  })

  useEffect(() => {
    const loadBrand = async () => {
      const { data, error } = await supabase.from('brand_settings').select('*').limit(1).single()
      if (data) {
        setFormData(data)
      }
      setDidLoad(true)
    }
    loadBrand()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const parsed = brandSchema.parse(formData)
      
      let res;
      if (formData.id) {
        res = await supabase.from('brand_settings').update(parsed).eq('id', formData.id)
      } else {
        res = await supabase.from('brand_settings').insert([parsed])
      }

      if (res.error) throw res.error
      toast('Brand settings saved successfully!', 'success')
      
      // refresh forms
      if (!formData.id) {
         const { data } = await supabase.from('brand_settings').select('id').limit(1).single()
         if (data) setFormData(prev => ({...prev, id: data.id}))
      }

    } catch (err: any) {
       console.error(err)
       toast(err?.issues ? err.issues[0]?.message : (err.message || 'Validation error'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <form onSubmit={handleSave} className="glass-card flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadZone 
              label="Company Logo"
              bucket="logos"
              value={formData.logo_url}
              onUploadSuccess={(url) => setFormData({...formData, logo_url: url})}
            />
            <FileUploadZone 
              label="Favicon"
              bucket="logos"
              value={formData.favicon_url}
              onUploadSuccess={(url) => setFormData({...formData, favicon_url: url})}
              accept=".ico,.png,.svg"
            />
          </div>

          <hr className="border-white/10" />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/80">Company Name</label>
            <input 
              type="text" 
              className="admin-input" 
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})}
            />
          </div>

          <TypographyPanel 
            label="Company Name"
            values={{
              fontFamily: formData.company_name_font_family,
              fontSize: formData.company_name_font_size,
              fontWeight: formData.company_name_font_weight,
              letterSpacing: formData.company_name_letter_spacing,
              color: formData.company_name_color,
            }}
            onChange={(k, v) => setFormData({...formData, [`company_name_${k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`]: v})}
          />

          <div className="flex justify-end mt-4">
            <button type="submit" disabled={isSaving} className="admin-button">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card sticky top-24 h-fit">
        <h3 className="text-lg font-bold mb-4 opacity-70">Live Preview</h3>
        <div className="h-48 border border-white/10 rounded-lg flex items-center justify-center p-4 bg-rich-black relative overflow-hidden">
           {/* Navigation Mockup */}
           <div className="absolute top-0 left-0 w-full p-4 flex items-center gap-3">
              {formData.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.logo_url} alt="Logo" className="h-8 w-auto object-contain" />
              )}
              <span 
                style={{
                  fontFamily: formData.company_name_font_family || 'inherit',
                  fontSize: formData.company_name_font_size || 'inherit',
                  fontWeight: formData.company_name_font_weight || 'inherit',
                  letterSpacing: formData.company_name_letter_spacing || 'inherit',
                  color: formData.company_name_color || 'inherit'
                }}
              >
                {formData.company_name}
              </span>
           </div>
        </div>
      </div>
    </div>
  )
}
