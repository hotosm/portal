/**
 * API service for making HTTP requests to the backend
 */

import type { HealthCheckResponse } from '../types/api'

const API_BASE_URL = '/api'

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
