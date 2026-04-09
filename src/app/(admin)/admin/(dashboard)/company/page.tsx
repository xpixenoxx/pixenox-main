'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/ui/ToastProvider'
import { RichTextEditor } from '@/components/admin/editors/RichTextEditor'

export default function CompanyStoryPage() {
  const [didLoad, setDidLoad] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [recordId, setRecordId] = useState<string | null>(null)
  
  // TipTap outputs structured JSON representing the document.
  // We initialize with an empty paragraph if null.
  const [contentJson, setContentJson] = useState<any>({
    type: 'doc',
    content: [{ type: 'paragraph' }]
  })
  
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    const loadStory = async () => {
      const { data, error } = await supabase.from('company_story').select('*').limit(1).single()
      if (data) {
        setRecordId(data.id)
        if (data.content_json) {
           setContentJson(data.content_json)
        }
      }
      setDidLoad(true)
    }
    loadStory()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let res;
      if (recordId) {
        res = await supabase.from('company_story').update({ content_json: contentJson }).eq('id', recordId)
      } else {
        res = await supabase.from('company_story').insert([{ content_json: contentJson }])
      }

      if (res.error) throw res.error
      toast('Company story saved successfully!', 'success')
      
      if (!recordId) {
         const { data } = await supabase.from('company_story').select('id').limit(1).single()
         if (data) setRecordId(data.id)
      }
    } catch (err: any) {
       console.error(err)
       toast(err.message || 'Error saving story', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  if (!didLoad) return <div className="animate-pulse bg-white/5 h-[600px] rounded-xl" />

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
       
       <div className="glass-card">
          <div className="flex flex-col gap-2 mb-6">
             <h2 className="text-xl font-bold">Company Story</h2>
             <p className="text-sm opacity-70">
               Use the Rich Text Editor to draft your company's narrative.
               The 'Typography' mark allows you to dynamically override the Font Family, Size, Weight, and Color of specific highlighted words, 
               without writing any manual CSS. Ensure to 'Save' to persist to Supabase JSONB.
             </p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
             
             <div className="min-h-[400px]">
                <RichTextEditor 
                  content={contentJson}
                  onChange={(json) => setContentJson(json)}
                />
             </div>

             <div className="flex justify-end pt-4 border-t border-white/10">
                <button type="submit" disabled={isSaving} className="admin-button px-8 shadow-[0_0_15px_rgba(74,14,143,0.3)]">
                   {isSaving ? 'Saving...' : 'Publish Knowledge'}
                </button>
             </div>
          </form>

       </div>

       {/* Brief output logic inspection section */}
       <div className="glass-card flex flex-col gap-4">
          <h3 className="font-bold border-b border-white/10 pb-2">JSON Structure Output</h3>
          <p className="text-xs opacity-50 mb-2">
             This is how the document tree is stored natively in PostgreSQL. The frontend framework renders this directly using <code className="bg-white/10 px-1 rounded text-deep-purple">@tiptap/react</code>.
          </p>
          <pre className="text-xs bg-black/40 p-4 rounded-lg overflow-x-auto max-h-[300px] text-white/70">
             {JSON.stringify(contentJson, null, 2)}
          </pre>
       </div>

       <DisciplinesManager />
    </div>
  )
}

function DisciplinesManager() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const toast = useToast()

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setLoading(true)
    const { data } = await supabase.from('what_we_do_cards').select('*').order('priority')
    if (data) setCards(data)
    setLoading(false)
  }

  const handleUpdate = (id: string, field: string, value: any) => {
    setCards(cards.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const saveCard = async (card: any) => {
    const { error } = await supabase.from('what_we_do_cards').update(card).eq('id', card.id)
    if (error) {
      toast('Error saving card: ' + error.message, 'error')
    } else {
      toast('Card saved successfully!', 'success')
      loadCards()
    }
  }

  if (loading) return null;

  return (
    <div className="glass-card flex flex-col gap-6 mt-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Disciplines (Cyber Cards)</h2>
        <p className="text-sm opacity-70">
          Manage the tech-focused disciplines on the Company page. The 'Icon SVG / JSON Metadata' field is used to store the Cyberpunk configuration (like LVL, Stats, and Button labels) passing valid JSON.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {cards.map((card, idx) => (
          <div key={card.id || idx} className="border border-white/10 rounded-lg p-6 flex flex-col gap-4 bg-black/20">
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
               <label className="text-xs font-bold opacity-60">JSON METADATA (replaces icon_svg)</label>
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
              <button 
                onClick={() => saveCard(card)}
                className="admin-button py-1 px-4 text-xs"
              >
                Save Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
