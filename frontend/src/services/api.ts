/**
 * API service for making HTTP requests to the backend
 */

import type { HealthCheckResponse } from '../types/api'

const API_BASE_URL = '/api'

/**
 * Build a full API endpoint URL, respecting the VITE_API_URL env variable.
 * Prevents double /api/api/ prefixes when the env var already ends with /api.
 *
 * @example
 * // With VITE_API_URL unset → "/api/homepage-map/projects/snapshot"
 * // With VITE_API_URL="https://example.com/api" → "https://example.com/api/homepage-map/..."
 * // With VITE_API_URL="https://example.com" → "https://example.com/api/homepage-map/..."
 */
export function buildApiEndpoint(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const configuredBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

  if (!configuredBase) {
    return `${API_BASE_URL}${normalizedPath}`
  }

  const hasApiSuffix = /\/api$/i.test(configuredBase)
  return `${configuredBase}${hasApiSuffix ? '' : '/api'}${normalizedPath}`
}

/**
 * Fetch health check status from the API
 *
 * @returns Promise with health check data
 * @throws Error if the request fails
 *
 * @example
 * ```typescript
 * const data = await getHealthCheck()
 * console.log(data.status) // "ok"
 * ```
 */
export async function getHealthCheck(): Promise<HealthCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/health-check`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}
