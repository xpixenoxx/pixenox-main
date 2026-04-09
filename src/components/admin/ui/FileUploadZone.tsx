'use client'

import React, { useCallback, useState } from 'react'
import { UploadCloud, X, File, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface FileUploadZoneProps {
  label?: string
  bucket: string
  folder?: string
  value?: string
  onUploadSuccess: (url: string) => void
  accept?: string
  maxSizeMB?: number
}

export function FileUploadZone({ 
  label, 
  bucket, 
  folder = '', 
  value, 
  onUploadSuccess, 
  accept = "image/*", 
  maxSizeMB = 10 
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const processFile = async (file: File) => {
    setError(null)
    if (!file) return

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size MUST be less than ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    setProgress(10) // Simulate start

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      setProgress(100)
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
        
      onUploadSuccess(publicUrl)
    } catch (err: any) {
      setError(err.message || 'Error uploading file')
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setProgress(0)
      }, 1000)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-white/80">{label}</label>}
      
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-all
          ${isDragging ? 'border-deep-purple bg-deep-purple/10' : 'border-white/20 bg-white/5'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-white/10'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
         <input 
           type="file" 
           accept={accept} 
           onChange={handleChange} 
           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
         />
         
         {isUploading ? (
            <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 border-4 border-deep-purple border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-white/80">Uploading... {progress}%</p>
               <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-deep-purple transition-all duration-300" style={{ width: `${progress}%` }} />
               </div>
            </div>
         ) : value ? (
            <div className="flex flex-col items-center gap-3 relative z-10 w-full">
               {value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={value} alt="Preview" className="max-h-32 object-contain rounded" />
               ) : (
                 <File className="w-12 h-12 text-white/50" />
               )}
               <div className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-full">
                 <CheckCircle2 className="w-4 h-4" />
                 Uploaded
               </div>
               <p className="text-xs text-white/50 break-all max-w-full">
                 {value}
               </p>
               <p className="text-xs text-deep-purple mt-2 font-medium">Click or drag replacing file</p>
            </div>
         ) : (
            <div className="flex flex-col items-center gap-2 text-white/60 pointer-events-none">
               <UploadCloud className="w-10 h-10 mb-2 opacity-50 text-white" />
               <p className="font-medium">Drag & drop your file here</p>
               <p className="text-xs opacity-70">or click to browse ({maxSizeMB}MB max)</p>
            </div>
         )}
      </div>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
