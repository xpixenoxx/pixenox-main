import { Mark, mergeAttributes } from '@tiptap/core'

export interface TypographyOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    typography: {
      setTypography: (attributes: { fontFamily?: string, fontSize?: string, fontWeight?: string, color?: string }) => ReturnType
      unsetTypography: () => ReturnType
    }
  }
}

export const TypographyMark = Mark.create<TypographyOptions>({
  name: 'typography',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: element => element.style.fontFamily || null,
        renderHTML: attributes => {
          if (!attributes.fontFamily) return {}
          return { style: `font-family: ${attributes.fontFamily}` }
        },
      },
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize || null,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
      fontWeight: {
        default: null,
        parseHTML: element => element.style.fontWeight || null,
        renderHTML: attributes => {
          if (!attributes.fontWeight) return {}
          return { style: `font-weight: ${attributes.fontWeight}` }
        },
      },
      color: {
        default: null,
        parseHTML: element => element.style.color || null,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[style]',
        getAttrs: node => {
          const style = (node as HTMLElement).getAttribute('style')
          if (!style) return false
          // only match if it contains one of our styles
          if (
            style.includes('font-family') ||
            style.includes('font-size') ||
            style.includes('font-weight') ||
            style.includes('color')
          ) {
            return null
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTypography: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      unsetTypography: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },
})
