
function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

// Host + path for display: no scheme, no "www.", no trailing slash. The href
// keeps the full URL.
function formatLinkLabel(url: string): string {
  try {
    const { host, pathname } = new URL(url)
    return `${host.replace(/^www\./i, '')}${pathname}`.replace(/\/+$/, '')
  } catch {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '')
  }
}

export {getInitials, formatLinkLabel}