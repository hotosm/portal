import MDEditor, { commands, type ICommand } from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import './MarkdownEditor.css'
import rehypeSanitize from 'rehype-sanitize'
import { cloneElement, isValidElement, type ReactElement } from 'react'

const ICON_SIZE = 18

// Reuse the library's own toolbar icons, just rendered larger.
function enlarge(command: ICommand): ICommand {
  if (!isValidElement(command.icon)) return command
  return {
    ...command,
    icon: cloneElement(
      command.icon as ReactElement<{ width?: number; height?: number }>,
      { width: ICON_SIZE, height: ICON_SIZE },
    ),
  }
}

// custom toolbar (remove unnecesary)
const toolbarCommands: ICommand[] = [
  enlarge(commands.bold),
  enlarge(commands.italic),
  commands.divider,
  enlarge(
    commands.group(
      [
        commands.title1,
        commands.title2,
        commands.title3,
        commands.title4,
      ],
      {
        name: 'title',
        groupName: 'title',
        icon: commands.heading.icon,
        buttonProps: { 'aria-label': 'Insert title' },
      },
    ),
  ),
  enlarge(commands.link),
  enlarge(commands.quote),
  enlarge(commands.code),
  commands.divider,
  enlarge(commands.unorderedListCommand),
  enlarge(commands.orderedListCommand),
  commands.divider,
  enlarge(commands.table),
]

const extraToolbarCommands: ICommand[] = [
  enlarge(commands.codeEdit),
  enlarge(commands.codeLive),
  commands.divider,
  enlarge(commands.fullscreen),
]

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
  return (
    <div className="markdown-editor" data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        textareaProps={{ id, placeholder }}
        height="100%"
        minHeight={350}
        visibleDragbar={false}
        commands={toolbarCommands}
        extraCommands={extraToolbarCommands}
        // Sanitize the live preview: the library renders raw HTML via
        // rehype-raw by default, so strip scripts/event handlers/unsafe URLs
        // to prevent XSS from user-entered markdown.
        previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
      />
    </div>
  )
}

export default MarkdownEditor
