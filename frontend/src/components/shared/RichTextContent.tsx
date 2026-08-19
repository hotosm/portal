import ReactMarkdown from 'react-markdown'

interface RichTextContentProps {
  content: string
  className?: string
}

/**
 * Renders a stored markdown string as sanitized HTML for display.
 *
 * Safe by default: react-markdown does not render raw HTML and strips unsafe
 * URL protocols, so user-entered markdown can't inject scripts here. Do NOT
 * add `rehype-raw` (which turns embedded HTML into live DOM nodes) without also
 * adding `rehype-sanitize` — doing so would reintroduce a stored-XSS hole.
 */
export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  return (
    <div className={`rte-editor ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
