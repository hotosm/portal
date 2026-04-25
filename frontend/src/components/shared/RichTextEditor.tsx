import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const styles = `
  .rte-editor .tiptap { outline: none; }
  .rte-editor .tiptap p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--hot-color-gray-400);
    pointer-events: none;
    float: left;
    height: 0;
  }
  .rte-editor .tiptap h2 { font-size: 1.25rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
  .rte-editor .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 0.4rem 0 0.2rem; }
  .rte-editor .tiptap p { margin: 0.15rem 0; }
  .rte-editor .tiptap ul { list-style-type: disc; padding-left: 1.25rem; margin: 0.25rem 0; }
  .rte-editor .tiptap ol { list-style-type: decimal; padding-left: 1.25rem; margin: 0.25rem 0; }
  .rte-editor .tiptap li { margin: 0.1rem 0; }
  .rte-editor .tiptap strong { font-weight: 600; }
  .rte-editor .tiptap em { font-style: italic; }
  .rte-editor .tiptap a { color: var(--hot-color-red-600); text-decoration: underline; cursor: pointer; }
`

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
        isActive ? 'bg-hot-red-100 text-hot-red-600' : 'text-hot-gray-600 hover:bg-hot-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

interface RichTextEditorProps {
  id?: string
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write something…',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    editorProps: id ? { attributes: { id } } : undefined,
    content: value,
    onUpdate({ editor }) {
      onChange(editor.isEmpty ? '' : editor.getHTML())
    },
  })

  if (!editor) return null

  const run = (fn: (c: ReturnType<typeof editor.chain>) => unknown) => () =>
    fn(editor.chain().focus())

  function handleLinkToggle() {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('URL')
    if (!url) return
    const href = url.startsWith('http') ? url : `https://${url}`
    editor.chain().focus().setLink({ href }).run()
  }

  return (
    <>
      <style>{styles}</style>
      <div className="border border-hot-gray-300 rounded-lg overflow-hidden focus-within:border-hot-red-500 transition-colors">
        <div className="flex flex-wrap gap-xs p-xs border-b border-hot-gray-200 bg-hot-gray-50">
          <ToolbarButton
            onClick={run((c) => c.toggleBold().run())}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleItalic().run())}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={run((c) => c.toggleHeading({ level: 2 }).run())}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <span className="font-bold text-xs">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleHeading({ level: 3 }).run())}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <span className="font-bold text-xs">H3</span>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={run((c) => c.toggleBulletList().run())}
            isActive={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="2" cy="3.5" r="1.5" />
              <rect x="5" y="2.5" width="10" height="2" rx="1" />
              <circle cx="2" cy="8" r="1.5" />
              <rect x="5" y="7" width="10" height="2" rx="1" />
              <circle cx="2" cy="12.5" r="1.5" />
              <rect x="5" y="11.5" width="10" height="2" rx="1" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleOrderedList().run())}
            isActive={editor.isActive('orderedList')}
            title="Ordered list"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <text x="0" y="5" fontSize="6" fontFamily="monospace">
                1.
              </text>
              <rect x="6" y="3" width="9" height="2" rx="1" />
              <text x="0" y="9.5" fontSize="6" fontFamily="monospace">
                2.
              </text>
              <rect x="6" y="7.5" width="9" height="2" rx="1" />
              <text x="0" y="14" fontSize="6" fontFamily="monospace">
                3.
              </text>
              <rect x="6" y="12" width="9" height="2" rx="1" />
            </svg>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={handleLinkToggle}
            isActive={editor.isActive('link')}
            title={editor.isActive('link') ? 'Remove link' : 'Add link'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M6.4 9.6a3.2 3.2 0 0 0 4.53.01l1.6-1.6a3.2 3.2 0 0 0-4.52-4.52L7.1 4.4a.8.8 0 1 0 1.13 1.13l.91-.91a1.6 1.6 0 0 1 2.26 2.26l-1.6 1.6a1.6 1.6 0 0 1-2.27 0 .8.8 0 0 0-1.13 1.13Z" />
              <path d="M9.6 6.4a3.2 3.2 0 0 0-4.53-.01l-1.6 1.6a3.2 3.2 0 0 0 4.52 4.52l.91-.91a.8.8 0 1 0-1.13-1.13l-.91.91a1.6 1.6 0 0 1-2.26-2.26l1.6-1.6a1.6 1.6 0 0 1 2.27 0 .8.8 0 0 0 1.13-1.13Z" />
            </svg>
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} className="rte-editor px-md py-sm text-base min-h-[5rem]" />
      </div>
    </>
  )
}

export default RichTextEditor
