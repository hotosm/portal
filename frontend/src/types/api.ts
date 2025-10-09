/**
 * Type definitions for API responses
 */

export interface DatabaseStatus {
  connected: boolean
  response_time_ms: number | null
}

export interface HealthCheckResponse {
  status: string
  timestamp: string
  database: DatabaseStatus
  message: string
}
