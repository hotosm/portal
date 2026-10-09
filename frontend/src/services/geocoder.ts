/**
 * Location autocomplete backed by Photon (https://photon.komoot.io).
 */

import { PHOTON_API_URL } from '../utils/envConfig'

export interface LocationSuggestion {
  label: string
}

interface PhotonProperties {
  name?: string
  city?: string
  state?: string
  country?: string
  countrycode?: string
  osm_key?: string
  osm_value?: string
}

interface PhotonResponse {
  features?: { properties?: PhotonProperties }[]
}

// Same cap as the profile's location column.
const MAX_LABEL_LENGTH = 200

const MAX_SUGGESTIONS = 5

/**
 * "<name>, <state>, <country>" from whichever parts exist, skipping a part that
 * repeats the one before it (a province's state is itself).
 */
function toLabel(properties: PhotonProperties): string {
  const parts: string[] = []
  for (const part of [properties.name, properties.state, properties.country]) {
    if (part && part !== parts[parts.length - 1]) parts.push(part)
  }
  return parts.join(', ')
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: '10' })
  for (const layer of ['city', 'state', 'country']) params.append('layer', layer)
  // Local names for now; Photon only translates to de/en/fr, not es.
  params.set('lang', 'default')

  const response = await fetch(`${PHOTON_API_URL}?${params}`, { signal })
  if (!response.ok) throw new Error(`Photon request failed: ${response.status}`)
  const data: PhotonResponse = await response.json()

  const labels = new Set<string>()
  for (const feature of data.features ?? []) {
    // Only places: boundary=administrative ("Municipio de …") duplicates the city.
    if (feature.properties?.osm_key !== 'place') continue
    const label = toLabel(feature.properties ?? {}).slice(0, MAX_LABEL_LENGTH)
    if (label) labels.add(label)
  }
  return [...labels].slice(0, MAX_SUGGESTIONS).map((label) => ({ label }))
}
