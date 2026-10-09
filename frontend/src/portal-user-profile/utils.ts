
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

// mailto: for the email; tel: for the phone, minus the spaces, dashes and
// brackets people type for readability, which a dialer doesn't want.
function contactHref(field: 'contact_email' | 'phone', value: string): string {
  return field === 'contact_email' ? `mailto:${value}` : `tel:${value.replace(/[^\d+]/g, '')}`
}

export {getInitials, formatLinkLabel, contactHref}