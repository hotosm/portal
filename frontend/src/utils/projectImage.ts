import type { AppName } from '../portal-plans/types'
import { osmTileUrl } from './osmTiles'

/**
 * Image that represents a project: a map tile from its location when the app
 * has one, else an image the upstream supplied, else null so the caller picks
 * its own placeholder.
 */
export function resolveProjectImage(
  app: AppName | null,
  upstream: Record<string, unknown> | null,
  data: Record<string, unknown> | null
): string | null {
  if (app === 'chatmap' || app === 'umap') {
    const centroid = (upstream?.centroid ?? data?.centroid) as [number, number] | null | undefined
    if (Array.isArray(centroid) && centroid.length === 2) {
      return osmTileUrl(centroid[0], centroid[1], 10)
    }
  }

  if (app === 'tasking-manager') {
    const src = upstream ?? data
    const bbox = src?.aoiBBOX as [number, number, number, number] | null | undefined
    if (Array.isArray(bbox) && bbox.length === 4) {
      const lat = (bbox[1] + bbox[3]) / 2
      const lon = (bbox[0] + bbox[2]) / 2
      return osmTileUrl(lat, lon, 10)
    }
  }

  if (app === 'sketchmap-tool') {
    const bbox = (upstream ?? data)?.bbox as [number, number, number, number] | null | undefined
    if (Array.isArray(bbox) && bbox.length === 4) {
      const lat = (bbox[1] + bbox[3]) / 2
      const lon = (bbox[0] + bbox[2]) / 2
      return osmTileUrl(lat, lon, 10)
    }
  }

  const src = upstream ?? data
  if (!src) return null
  const img = src.image_url ?? src.thumbnail_url ?? src.thumbnail ?? src.image
  return typeof img === 'string' && img ? img : null
}
