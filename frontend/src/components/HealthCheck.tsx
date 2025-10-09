/**
 * HealthCheck component - Example of fetching data from the API
 *
 * This component demonstrates:
 * - Using React hooks (useState, useEffect)
 * - Async data fetching
 * - Error handling
 * - Loading states
 * - TypeScript integration
 */

import { useEffect, useState } from 'react'
import { getHealthCheck } from '../services/api'
import type { HealthCheckResponse } from '../types/api'

export function HealthCheck() {
  const [data, setData] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHealth() {
      try {
        setLoading(true)
        const healthData = await getHealthCheck()
        setData(healthData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health check')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>API Health Check</h2>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>API Health Check</h2>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>❌ Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>API Health Check</h2>

      {data && (
        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>Status:</span>
            <span
              style={{
                ...styles.value,
                color: data.status === 'ok' ? '#10b981' : '#ef4444',
              }}
            >
              {data.status === 'ok' ? '✅ ' : '❌ '}
              {data.status}
            </span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Message:</span>
            <span style={styles.value}>{data.message}</span>
          </div>

          <div style={styles.row}>
            <span style={styles.label}>Database:</span>
            <span style={styles.value}>
              {data.database.connected ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>

          {data.database.response_time_ms !== null && (
            <div style={styles.row}>
              <span style={styles.label}>Response Time:</span>
              <span style={styles.value}>{data.database.response_time_ms.toFixed(2)} ms</span>
            </div>
          )}

          <div style={styles.row}>
            <span style={styles.label}>Timestamp:</span>
            <span style={styles.value}>{new Date(data.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}

      <p style={styles.note}>
        This is an example component showing how to interact with the FastAPI backend.
      </p>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  label: {
    fontWeight: '600',
    color: '#4b5563',
  },
  value: {
    color: '#1f2937',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  errorText: {
    color: '#991b1b',
    margin: 0,
  },
  note: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '1rem',
  },
}
