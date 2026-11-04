/**
 * Reduces a stored description (markdown, possibly with raw HTML) to plain
 * single-line text for previews. HTML is parsed with DOMParser, which builds an
 * inert document, so nothing in the input is executed or loaded.
 */
export function toPlainText(source: string): string {
  const withoutMarkdown = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__|~~)(.*?)\1/g, '$2')
    .replace(/(\*|_|`)(.*?)\1/g, '$2')

  const spaced = withoutMarkdown.replace(
    /<\/(?:h[1-6]|p|div|li|ul|ol|blockquote|pre|tr)>|<br\s*\/?>/gi,
    '$& '
  )
  const text = new DOMParser().parseFromString(spaced, 'text/html').body.textContent ?? ''
  return text.replace(/\s+/g, ' ').trim()
}
