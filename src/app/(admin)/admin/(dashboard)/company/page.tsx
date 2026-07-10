'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { RichTextEditor } from '@/components/admin/editors/RichTextEditor'

export default function CompanyPageAdmin() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12 pb-24">
      <div>
        <h1 className="text-3xl font-bold mb-2">Company Page CMS</h1>
        <p className="opacity-70">Manage all structural content for the public Company page.</p>
      </div>

      <CompanyHeroManager />
      <CompanyStoryManager />
      <DisciplinesManager />
      <CoreBeliefsManager />
      <CompanyCtaManager />
    </div>
  )
}

function CompanyHeroManager() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: res } = await supabase.from('page_hero_config').select('*').eq('page', 'company').single()
    if (res) {
      setData(res)
    } else {
      setData({ 
        page: 'company', 
        heading: 'STARTUPS DREAM BIG.', 
        subheading: "We're a design-led digital studio turning complex challenges into measurable results." 
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    let res;
    if (data.id) {
      res = await supabase.from('page_hero_config').update({ heading: data.heading, subheading: data.subheading }).eq('id', data.id)
    } else {
      res = await supabase.from('page_hero_config').insert([data])
    }
    setSaving(false)
    if (res.error) toast('Error saving hero: ' + res.error.message, 'error')
    else { toast('Hero saved successfully', 'success'); load(); }
  }

  if (loading) return <div className="animate-pulse bg-white/5 h-40 rounded-xl" />

  return (
    <div className="glass-card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">1. Hero Section</h2>
        <p className="text-sm opacity-70">Kinetic fluid text at the very top of the page.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">HEADING</label>
          <input 
            type="text" 
            value={data?.heading || ''} 
            onChange={(e) => setData({ ...data, heading: e.target.value })}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">SUBHEADING</label>
          <textarea 
            value={data?.subheading || ''} 
            onChange={(e) => setData({ ...data, subheading: e.target.value })}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple min-h-[80px]"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <button onClick={handleSave} disabled={saving} className="admin-button px-6">
          {saving ? 'Saving...' : 'Save Hero'}
        </button>
      </div>
    </div>
  )
}

function CompanyStoryManager() {
  const [recordId, setRecordId] = useState<string | null>(null)
  const [configId, setConfigId] = useState<string | null>(null)
  const [title, setTitle] = useState('Our Story')
  const [contentJson, setContentJson] = useState<any>({ type: 'doc', content: [{ type: 'paragraph' }] })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [storyRes, configRes] = await Promise.all([
      supabase.from('company_story').select('*').limit(1).single(),
      supabase.from('section_config').select('*').eq('section_key', 'company_story').limit(1).single()
    ])
    
    if (storyRes.data) {
      setRecordId(storyRes.data.id)
      if (storyRes.data.content_json) setContentJson(storyRes.data.content_json)
    }
    
    if (configRes.data) {
      setConfigId(configRes.data.id)
      setTitle(configRes.data.heading || 'Our Story')
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Save Title to section_config
      if (configId) {
        await supabase.from('section_config').update({ heading: title }).eq('id', configId)
      } else {
        await supabase.from('section_config').insert([{ section_key: 'company_story', heading: title }])
      }

      // Save content to company_story
      if (recordId) {
        await supabase.from('company_story').update({ content_json: contentJson }).eq('id', recordId)
      } else {
        await supabase.from('company_story').insert([{ content_json: contentJson }])
      }

      toast('Mission saved successfully!', 'success')
      load()
    } catch (err: any) {
       toast(err.message || 'Error saving', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse bg-white/5 h-40 rounded-xl" />

  return (
    <div className="glass-card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">2. Overarching Mission</h2>
        <p className="text-sm opacity-70">The main storytelling section. Highlight words using the Rich Text Typography tool.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">SECTION TITLE</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
        </div>
         
        <div className="min-h-[400px]">
          <label className="text-xs font-bold opacity-60 mb-2 block">RICH TEXT DESCRIPTION</label>
          <RichTextEditor 
            content={contentJson}
            onChange={(json) => setContentJson(json)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button type="submit" disabled={saving} className="admin-button px-8">
             {saving ? 'Saving...' : 'Save Mission'}
          </button>
        </div>
      </form>
    </div>
  )
}

function DisciplinesManager() {
  const [configId, setConfigId] = useState<string | null>(null)
  const [title, setTitle] = useState('Our Disciplines')
  const [cards, setCards] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [savingTitle, setSavingTitle] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [configRes, cardsRes] = await Promise.all([
      supabase.from('section_config').select('*').eq('section_key', 'disciplines').limit(1).single(),
      supabase.from('what_we_do_cards').select('*').order('priority')
    ])
    
    if (configRes.data) {
      setConfigId(configRes.data.id)
      setTitle(configRes.data.heading || 'Our Disciplines')
    }
    if (cardsRes.data) setCards(cardsRes.data)
    setLoading(false)
  }

  const handleTitleSave = async () => {
    setSavingTitle(true)
    if (configId) {
      await supabase.from('section_config').update({ heading: title }).eq('id', configId)
    } else {
      await supabase.from('section_config').insert([{ section_key: 'disciplines', heading: title }])
    }
    setSavingTitle(false)
    toast('Section title saved', 'success')
    load()
  }

  const handleUpdate = (id: string, field: string, value: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const saveCard = async (card: any) => {
    const { error } = await supabase.from('what_we_do_cards').update(card).eq('id', card.id)
    if (error) toast('Error saving card: ' + error.message, 'error')
    else toast('Card saved!', 'success')
  }

  const addCard = async () => {
    const newPriority = cards.length > 0 ? Math.max(...cards.map(c => c.priority || 0)) + 10 : 10;
    const { error } = await supabase.from('what_we_do_cards').insert([{ 
      title: 'New Discipline', 
      description: 'Description here',
      is_visible: true,
      priority: newPriority
    }])
    if (error) toast('Error adding card', 'error')
    else { toast('Card added', 'success'); load(); }
  }

  const deleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    const { error } = await supabase.from('what_we_do_cards').delete().eq('id', id)
    if (error) toast('Error deleting card', 'error')
    else { toast('Card deleted', 'success'); load(); }
  }

  if (loading) return <div className="animate-pulse bg-white/5 h-40 rounded-xl" />

  return (
    <div className="glass-card flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">3. Our Disciplines</h2>
        <p className="text-sm opacity-70">Manage the tech-focused disciplines and cyberpunk stats.</p>
      </div>

      {/* SECTION TITLE */}
      <div className="flex flex-col gap-1 pb-6 border-b border-white/10">
        <label className="text-xs font-bold opacity-60">SECTION TITLE</label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
          <button onClick={handleTitleSave} disabled={savingTitle} className="admin-button px-6">
             {savingTitle ? '...' : 'Save Title'}
          </button>
        </div>
      </div>

      {/* CARDS LIST */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Cards</h3>
        <button onClick={addCard} className="admin-button px-4 py-1 text-sm">+ Add Card</button>
      </div>

      <div className="flex flex-col gap-8">
        {cards.map((card, idx) => (
          <div key={card.id || idx} className="border border-white/10 rounded-lg p-6 flex flex-col gap-4 bg-black/20 relative group">
            <button 
              onClick={() => deleteCard(card.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-sm"
            >
              Delete
            </button>
            <h3 className="font-bold text-deep-purple">Card {idx + 1}</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">TITLE</label>
              <input 
                type="text" 
                value={card.title || ''} 
                onChange={(e) => handleUpdate(card.id, 'title', e.target.value)}
                className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
              />
            </div>

            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold opacity-60">DESCRIPTION</label>
               <textarea 
                 value={card.description || ''} 
                 onChange={(e) => handleUpdate(card.id, 'description', e.target.value)}
                 className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple min-h-[80px]"
               />
            </div>

            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold opacity-60">JSON METADATA (Stats & HUD)</label>
               <textarea 
                 value={card.icon_svg || ''} 
                 onChange={(e) => handleUpdate(card.id, 'icon_svg', e.target.value)}
                 placeholder='e.g. {"lvl": "LVL_01", "label": "// OPERATIVE", "stats": [{"label": "INTEL", "val": "0xF2", "width": "80%"}, {"label": "SPEED", "val": "0xE0", "width": "70%"}], "button": ""}'
                 className="bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-deep-purple min-h-[120px]"
               />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={card.is_visible} 
                  onChange={(e) => handleUpdate(card.id, 'is_visible', e.target.checked)} 
                />
                Visible
              </label>
              <div className="flex-1" />
              <button onClick={() => saveCard(card)} className="admin-button py-1 px-4 text-xs">
                Save Card
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm opacity-50">No cards added yet.</p>}
      </div>
    </div>
  )
}


function CoreBeliefsManager() {
  const [config, setConfig] = useState<any>({ section_heading: 'Core Beliefs', section_subheading: '' })
  const [cards, setCards] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [savingConfig, setSavingConfig] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [configRes, cardsRes] = await Promise.all([
      supabase.from('how_we_think_config').select('*').limit(1).single(),
      supabase.from('core_beliefs').select('*').order('priority')
    ])
    
    if (configRes.data) setConfig(configRes.data)
    if (cardsRes.data) setCards(cardsRes.data)
    setLoading(false)
  }

  const handleConfigSave = async () => {
    setSavingConfig(true)
    if (config.id) {
      await supabase.from('how_we_think_config').update({ section_heading: config.section_heading, section_subheading: config.section_subheading }).eq('id', config.id)
    } else {
      await supabase.from('how_we_think_config').insert([config])
    }
    setSavingConfig(false)
    toast('Config saved', 'success')
    load()
  }

  const handleUpdate = (id: string, field: string, value: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const saveCard = async (card: any) => {
    const { error } = await supabase.from('core_beliefs').update(card).eq('id', card.id)
    if (error) toast('Error saving card: ' + error.message, 'error')
    else toast('Card saved!', 'success')
  }

  const addCard = async () => {
    const newPriority = cards.length > 0 ? Math.max(...cards.map(c => c.priority || 0)) + 10 : 10;
    const { error } = await supabase.from('core_beliefs').insert([{ 
      title: 'New Belief', 
      description: 'Description here',
      is_visible: true,
      priority: newPriority
    }])
    if (error) toast('Error adding card', 'error')
    else { toast('Card added', 'success'); load(); }
  }

  const deleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this belief?')) return;
    const { error } = await supabase.from('core_beliefs').delete().eq('id', id)
    if (error) toast('Error deleting card', 'error')
    else { toast('Card deleted', 'success'); load(); }
  }

  if (loading) return <div className="animate-pulse bg-white/5 h-40 rounded-xl" />

  return (
    <div className="glass-card flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">4. Core Beliefs</h2>
        <p className="text-sm opacity-70">Manage the horizontal scrolling Core Beliefs section.</p>
      </div>

      {/* SECTION CONFIG */}
      <div className="flex flex-col gap-4 pb-6 border-b border-white/10">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">SECTION TITLE</label>
          <input 
            type="text" 
            value={config.section_heading || ''} 
            onChange={(e) => setConfig({ ...config, section_heading: e.target.value })}
            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">SECTION DESCRIPTION</label>
          <textarea 
            value={config.section_subheading || ''} 
            onChange={(e) => setConfig({ ...config, section_subheading: e.target.value })}
            className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple min-h-[80px]"
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleConfigSave} disabled={savingConfig} className="admin-button px-6">
             {savingConfig ? '...' : 'Save Config'}
          </button>
        </div>
      </div>

      {/* CARDS LIST */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Cards</h3>
        <button onClick={addCard} className="admin-button px-4 py-1 text-sm">+ Add Card</button>
      </div>

      <div className="flex flex-col gap-8">
        {cards.map((card, idx) => (
          <div key={card.id || idx} className="border border-white/10 rounded-lg p-6 flex flex-col gap-4 bg-black/20 relative group">
            <button 
              onClick={() => deleteCard(card.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity text-sm"
            >
              Delete
            </button>
            <h3 className="font-bold text-deep-purple">Card {idx + 1}</h3>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold opacity-60">TITLE</label>
              <input 
                type="text" 
                value={card.title || ''} 
                onChange={(e) => handleUpdate(card.id, 'title', e.target.value)}
                className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
              />
            </div>

            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold opacity-60">DESCRIPTION</label>
               <textarea 
                 value={card.description || ''} 
                 onChange={(e) => handleUpdate(card.id, 'description', e.target.value)}
                 className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple min-h-[80px]"
               />
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={card.is_visible} 
                  onChange={(e) => handleUpdate(card.id, 'is_visible', e.target.checked)} 
                />
                Visible
              </label>
              <div className="flex-1" />
              <button onClick={() => saveCard(card)} className="admin-button py-1 px-4 text-xs">
                Save Card
              </button>
            </div>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm opacity-50">No cards added yet.</p>}
      </div>
    </div>
  )
}

function CompanyCtaManager() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: res } = await supabase.from('cta_sections').select('*').eq('section_key', 'lets_build').single()
    if (res) {
      setData(res)
    } else {
      setData({ 
        section_key: 'lets_build', 
        heading: "LET'S MAKE SOMETHING THAT MATTERS.", 
        subheading: "Ready to scale your engineering?",
        btn_text: "Contact Us" 
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    let res;
    if (data.id) {
      res = await supabase.from('cta_sections').update({ 
        heading: data.heading, 
        subheading: data.subheading,
        btn_text: data.btn_text
      }).eq('id', data.id)
    } else {
      res = await supabase.from('cta_sections').insert([data])
    }
    setSaving(false)
    if (res.error) toast('Error saving CTA: ' + res.error.message, 'error')
    else { toast('CTA saved successfully', 'success'); load(); }
  }

  if (loading) return <div className="animate-pulse bg-white/5 h-40 rounded-xl" />

  return (
    <div className="glass-card flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">5. CTA Section</h2>
        <p className="text-sm opacity-70">The final call to action at the bottom of the page.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">HEADING</label>
          <input 
            type="text" 
            value={data?.heading || ''} 
            onChange={(e) => setData({ ...data, heading: e.target.value })}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">DESCRIPTION / SUBHEADING</label>
          <textarea 
            value={data?.subheading || ''} 
            onChange={(e) => setData({ ...data, subheading: e.target.value })}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple min-h-[80px]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold opacity-60">BUTTON TEXT</label>
          <input 
            type="text" 
            value={data?.btn_text || ''} 
            onChange={(e) => setData({ ...data, btn_text: e.target.value })}
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-deep-purple"
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <button onClick={handleSave} disabled={saving} className="admin-button px-6">
          {saving ? 'Saving...' : 'Save CTA'}
        </button>
      </div>
    </div>
  )
}
