'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { ColorPicker } from '@/components/admin/ui/ColorPicker'
import { TypographyPanel } from '@/components/admin/ui/TypographyPanel'
import { FileUploadZone } from '@/components/admin/ui/FileUploadZone'
import { heroSchema } from '@/lib/validators/hero'

const DEFAULT_HERO = {
  id: '',
  headline: 'Building the Future of Digital',
  headline_color: '#ffffff',
  subheadline: 'We engineer AAA-grade platforms that perform globally.',
  subheadline_color: 'rgba(255,255,255,0.75)',
  cta_text: 'Let\'s Discuss Content',
  cta_url: '/contact',
  cta_bg_color: '#4a0e8f',
  cta_hover_bg_color: '#6b21d4',
  cta_text_color: '#ffffff',
  cta_border_radius: '8px',
  bg_type: 'gradient',
  bg_gradient_start: '#0a0a0f',
  bg_gradient_end: '#1a0533',
  bg_image_url: '',
  bg_video_url: ''
}

export default function HeroPage() {
  const [formData, setFormData] = useState<any>(DEFAULT_HERO)
  const [didLoad, setDidLoad] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    const loadHero = async () => {
      const { data, error } = await supabase.from('hero_settings').select('*').limit(1).single()
      if (data) {
        setFormData((prev: any) => ({ ...prev, ...data }))
      }
      setDidLoad(true)
    }
    loadHero()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const parsed = heroSchema.parse(formData)
      let res;
      if (formData.id) {
        res = await supabase.from('hero_settings').update(parsed).eq('id', formData.id)
      } else {
        res = await supabase.from('hero_settings').insert([parsed])
      }

      if (res.error) throw res.error
      toast('Hero settings saved successfully!', 'success')
      
      if (!formData.id) {
         const { data } = await supabase.from('hero_settings').select('id').limit(1).single()
         if (data) setFormData((prev: any) => ({...prev, id: data.id}))
      }
    } catch (err: any) {
      console.error(err)
      toast(err?.issues ? err.issues[0]?.message : (err.message || 'Validation error'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  // Type-safe change handler for nested typography keys
  const handleExtChange = (prefix: string, key: string, value: string) => {
    const dbKey = `${prefix}_${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)}`
    setFormData((prev: any) => ({ ...prev, [dbKey]: value }))
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-96 rounded-xl" />

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div>
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* HEADLINE */}
          <div className="glass-card flex flex-col gap-6">
             <h3 className="text-xl font-bold border-b border-white/10 pb-4">Headline</h3>
             
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-white/80">Text</label>
               <textarea 
                 className="admin-input min-h-[100px]" 
                 value={formData.headline}
                 onChange={(e) => handleChange('headline', e.target.value)}
                 required
               />
             </div>
             
             <TypographyPanel 
               label="Headline"
               values={{
                 color: formData.headline_color,
               }}
               onChange={(k, v) => handleExtChange('headline', k, v)}
             />
          </div>

          {/* SUBHEADLINE */}
          <div className="glass-card flex flex-col gap-6">
             <h3 className="text-xl font-bold border-b border-white/10 pb-4">Subheadline</h3>
             
             <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-white/80">Text</label>
               <textarea 
                 className="admin-input min-h-[100px]" 
                 value={formData.subheadline}
                 onChange={(e) => handleChange('subheadline', e.target.value)}
               />
             </div>
             
             <TypographyPanel 
               label="Subheadline"
               values={{
                 color: formData.subheadline_color,
               }}
               onChange={(k, v) => handleExtChange('subheadline', k, v)}
             />
          </div>

          {/* CTA */}
          <div className="glass-card flex flex-col gap-6">
             <h3 className="text-xl font-bold border-b border-white/10 pb-4">CTA Button</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Text</label>
                 <input className="admin-input" value={formData.cta_text} onChange={(e) => handleChange('cta_text', e.target.value)} />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">URL</label>
                 <input className="admin-input" value={formData.cta_url} onChange={(e) => handleChange('cta_url', e.target.value)} />
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <ColorPicker label="Background Color" value={formData.cta_bg_color} onChange={(v) => handleChange('cta_bg_color', v)} />
               <ColorPicker label="Hover BG Color" value={formData.cta_hover_bg_color} onChange={(v) => handleChange('cta_hover_bg_color', v)} />
               <ColorPicker label="Text Color" value={formData.cta_text_color} onChange={(v) => handleChange('cta_text_color', v)} />
             </div>

             <div className="grid grid-cols-1 gap-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-medium text-white/80">Border Radius</label>
                 <select className="admin-input appearance-none" value={formData.cta_border_radius} onChange={(e) => handleChange('cta_border_radius', e.target.value)}>
                   <option value="999px">Pill</option>
                   <option value="12px">Rounded</option>
                   <option value="8px">Soft</option>
                   <option value="0px">Sharp</option>
                 </select>
               </div>
             </div>
          </div>

          {/* BACKGROUND */}
          <div className="glass-card flex flex-col gap-6">
             <h3 className="text-xl font-bold border-b border-white/10 pb-4">Background Settings</h3>
             
             <div className="flex gap-6">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" value="gradient" checked={formData.bg_type === 'gradient'} onChange={(e) => handleChange('bg_type', e.target.value)} />
                 <span>Gradient</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" value="image" checked={formData.bg_type === 'image'} onChange={(e) => handleChange('bg_type', e.target.value)} />
                 <span>Image</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" value="video" checked={formData.bg_type === 'video'} onChange={(e) => handleChange('bg_type', e.target.value)} />
                 <span>Video</span>
               </label>
             </div>
             
             {formData.bg_type === 'gradient' && (
                <div className="grid grid-cols-2 gap-4">
                   <ColorPicker label="Gradient Start" value={formData.bg_gradient_start} onChange={(v) => handleChange('bg_gradient_start', v)} />
                   <ColorPicker label="Gradient End" value={formData.bg_gradient_end} onChange={(v) => handleChange('bg_gradient_end', v)} />
                </div>
             )}

             {formData.bg_type === 'image' && (
                <FileUploadZone 
                  label="Background Image"
                  bucket="hero-images"
                  value={formData.bg_image_url}
                  onUploadSuccess={(url) => handleChange('bg_image_url', url)}
                />
             )}

             {formData.bg_type === 'video' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/80">Video URL (MP4/WebM or YouTube embed)</label>
                  <input className="admin-input" value={formData.bg_video_url} onChange={(e) => handleChange('bg_video_url', e.target.value)} />
                </div>
             )}
          </div>

          <div className="sticky bottom-0 bg-rich-black/80 backdrop-blur pb-6 pt-4 border-t border-white/10 mt-4 flex justify-end">
            <button type="submit" disabled={isSaving} className="admin-button px-8 shadow-xl shadow-deep-purple/20">
              {isSaving ? 'Saving...' : 'Save Hero Settings'}
            </button>
          </div>

        </form>
      </div>

      <div className="sticky top-24 h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-2xl shadow-deep-purple/10 border border-white/10 flex flex-col">
        <div className="bg-white/5 p-3 border-b border-white/10 shrink-0 font-medium opacity-60">
           Hero Preview Frame
        </div>
        
        {/* Actual Preview Representation */}
        <div 
          className="flex-1 relative flex items-center justify-center p-12 overflow-y-auto"
          style={
            formData.bg_type === 'gradient'
            ? { background: `linear-gradient(to bottom right, ${formData.bg_gradient_start}, ${formData.bg_gradient_end})`}
            : formData.bg_type === 'image' && formData.bg_image_url
              ? { backgroundImage: `url(${formData.bg_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center'}
              : { backgroundColor: '#0a0a0f' }
          }
        >
           <div className="relative z-10 max-w-4xl text-center flex flex-col items-center">
              <h1 
                 style={{
                   color: formData.headline_color,
                 }}
                 className="mb-6 whitespace-pre-wrap"
              >
                {formData.headline}
              </h1>

              <p 
                 style={{
                   color: formData.subheadline_color,
                 }}
                 className="mb-10 max-w-2xl whitespace-pre-wrap"
              >
                 {formData.subheadline}
              </p>

              {formData.cta_text && (
                 <button
                    style={{
                      backgroundColor: formData.cta_bg_color,
                      color: formData.cta_text_color,
                      borderRadius: formData.cta_border_radius,
                    }}
                    className="px-8 py-4 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = formData.cta_hover_bg_color}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.cta_bg_color}
                 >
                    {formData.cta_text}
                 </button>
              )}
           </div>

           {/* Video Preview Overlay */}
           {formData.bg_type === 'video' && formData.bg_video_url && (
              <div className="absolute inset-0 z-0">
                <video src={formData.bg_video_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-50" />
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
