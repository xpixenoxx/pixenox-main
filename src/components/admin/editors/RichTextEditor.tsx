'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TypographyMark } from './TypographyMark'
import { Bold, Italic, Strikethrough } from 'lucide-react'
import { FontSelector } from '../ui/FontSelector'
import { ColorPicker } from '../ui/ColorPicker'

interface RichTextEditorProps {
  content: string | object
  onChange: (json: object) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TypographyMark,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from === to) {
        setShowToolbar(false)
        return
      }

      // Position the floating toolbar near the selection
      const domSelection = window.getSelection()
      if (domSelection && domSelection.rangeCount > 0 && containerRef.current) {
        const range = domSelection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()

        setToolbarPos({
          top: rect.top - containerRect.top - 10,
          left: rect.left - containerRect.left + rect.width / 2,
        })
        setShowToolbar(true)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[150px] p-4 focus:outline-none',
      },
    },
  })

  // Synchronize external content changes
  useEffect(() => {
    if (editor && typeof content === 'object' && JSON.stringify(content) !== JSON.stringify(editor.getJSON())) {
       editor.commands.setContent(content)
    }
  }, [content, editor])

  // Hide toolbar on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowToolbar(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!editor) {
    return <div className="min-h-[150px] p-4 border border-white/10 rounded-lg animate-pulse bg-white/5" />
  }

  return (
    <div ref={containerRef} className="border border-white/10 rounded-lg overflow-hidden bg-white/5 relative">
      {/* Static Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border-b border-white/10 bg-black/20">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <div className="w-28">
          <FontSelector
            label=""
            value={editor.getAttributes('typography').fontFamily || ''}
            onChange={(v) => editor.chain().focus().setTypography({ fontFamily: v }).run()}
          />
        </div>

        <input
          type="text"
          className="admin-input p-1.5 text-xs h-[34px] w-20"
          placeholder="Size"
          value={editor.getAttributes('typography').fontSize || ''}
          onChange={(e) => editor.chain().focus().setTypography({ fontSize: e.target.value }).run()}
        />

        <input
          type="text"
          className="admin-input p-1.5 text-xs h-[34px] w-16"
          placeholder="Weight"
          value={editor.getAttributes('typography').fontWeight || ''}
          onChange={(e) => editor.chain().focus().setTypography({ fontWeight: e.target.value }).run()}
        />

        <ColorPicker
          value={editor.getAttributes('typography').color || editor.getAttributes('textStyle').color || ''}
          onChange={(v) => editor.chain().focus().setTypography({ color: v }).run()}
        />

        <button
          type="button"
          className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs font-medium"
          onClick={() => editor.chain().focus().unsetTypography().run()}
        >
          Clear
        </button>
      </div>

      {/* Floating Selection Toolbar */}
      {showToolbar && (
        <div
          className="absolute z-50 flex gap-2 p-2 bg-rich-black border border-white/10 rounded-lg shadow-xl shadow-black/50 -translate-x-1/2 -translate-y-full pointer-events-auto"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('bold') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('italic') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded text-xs ${editor.isActive('strike') ? 'bg-deep-purple text-white' : 'hover:bg-white/10 text-white/70'}`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
