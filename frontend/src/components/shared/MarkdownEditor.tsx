import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import './MarkdownEditor.css'
import { useState } from 'react'
import rehypeSanitize from 'rehype-sanitize'
import Switch from './Switch'

interface MarkdownEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = 'Write something…',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="markdown-editor" data-color-mode="light">
      <div className="flex justify-end pb-2xs">
        <Switch
          size="small"
          checked={showPreview}
          onChange={() => setShowPreview((on) => !on)}
          className="text-sm text-hot-gray-700"
        >
          Preview
        </Switch>
      </div>
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        textareaProps={{ id, placeholder }}
        height="100%"
        minHeight={350}
        visibleDragbar={false}
        hideToolbar
        preview={showPreview ? 'live' : 'edit'}
        // Sanitize the live preview: the library renders raw HTML via
        // rehype-raw by default, so strip scripts/event handlers/unsafe URLs
        // to prevent XSS from user-entered markdown.
        previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
      />
    </div>
  )
}

export default MarkdownEditor
