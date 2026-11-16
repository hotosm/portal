import ReactMarkdown, { type Components } from 'react-markdown'

interface RichTextContentProps {
  content: string
  className?: string
}

// Markdown always renders inside a page that already has its own h1, so every
// heading is shifted down one level (h6 stays h6).
const components: Components = {
  h1: ({ node: _node, ...props }) => <h2 {...props} />,
  h2: ({ node: _node, ...props }) => <h3 {...props} />,
  h3: ({ node: _node, ...props }) => <h4 {...props} />,
  h4: ({ node: _node, ...props }) => <h5 {...props} />,
  h5: ({ node: _node, ...props }) => <h6 {...props} />,
  h6: ({ node: _node, ...props }) => <h6 {...props} />,
}

/**
 * Renders a stored markdown string as sanitized HTML for display.
 *
 * Safe by default: react-markdown does not render raw HTML and strips unsafe
 * URL protocols, so user-entered markdown can't inject scripts here. Do NOT
 * add `rehype-raw` (which turns embedded HTML into live DOM nodes) without also
 * adding `rehype-sanitize` — doing so would reintroduce a stored-XSS hole.
 *
 * Headings render one level down: the markdown always sits inside a page that
 * already has its h1.
 */
export function RichTextContent({ content, className = '' }: RichTextContentProps) {
  return (
    <div className={`rte-editor ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
}
