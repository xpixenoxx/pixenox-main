'use client'

import React, { useCallback, useState } from 'react'
import { UploadCloud, X, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MultiImageUploadProps {
  label?: string
  bucket: string
  folder?: string
  values: string[]
  onChange: (urls: string[]) => void
  accept?: string
  maxSizeMB?: number
}

function SortableImage({ url, id, onRemove }: { url: string, id: string, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto' }

  return (
    <div ref={setNodeRef} style={style} className={`relative group w-32 h-32 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 ${isDragging ? 'shadow-2xl ring-2 ring-deep-purple' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
      
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button type="button" {...attributes} {...listeners} className="p-2 bg-white/10 rounded hover:bg-white/20 text-white cursor-grab">
          <GripVertical size={16} />
        </button>
        <button type="button" onClick={onRemove} className="p-2 bg-red-500/50 rounded hover:bg-red-500 text-white">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function MultiImageUpload({ label, bucket, folder = '', values = [], onChange, accept = "image/*", maxSizeMB = 10 }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const processFiles = async (files: FileList | File[]) => {
    setError(null)
    const newUrls: string[] = []
    
    setIsUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.size > maxSizeMB * 1024 * 1024) continue
        
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = folder ? `${folder}/${fileName}` : fileName

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
        newUrls.push(publicUrl)
      }
      if (newUrls.length > 0) {
        onChange([...values, ...newUrls])
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const handleRemove = (urlToRemove: string) => {
    onChange(values.filter(url => url !== urlToRemove))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = values.indexOf(active.id as string)
      const newIndex = values.indexOf(over.id as string)
      onChange(arrayMove(values, oldIndex, newIndex))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      
      {/* Upload Zone */}
      <div className="relative border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer">
        <input multiple type="file" accept={accept} onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        {isUploading ? (
          <div className="flex items-center gap-2 text-deep-purple font-medium">
            <div className="w-5 h-5 border-2 border-deep-purple border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-white/60 pointer-events-none">
            <UploadCloud className="w-8 h-8 opacity-50 text-white" />
            <p className="font-medium text-sm">Click or Drag images to add</p>
          </div>
        )}
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
      
      {/* Image Gallery */}
      {values.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={values} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-4 mt-2">
              {values.map((url, index) => (
                <div key={url} className="relative">
                   {index === 0 && (
                     <div className="absolute -top-2 -left-2 bg-deep-purple text-white text-[10px] font-bold px-2 py-1 rounded shadow z-10 uppercase tracking-widest pointer-events-none">
                       Cover
                     </div>
                   )}
                   <SortableImage id={url} url={url} onRemove={() => handleRemove(url)} />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
