import { HealthCheck } from './components/HealthCheck'

function App() {
  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Portal</h1>
        <p style={styles.headerSubtitle}>FastAPI + React + PostGIS</p>
      </header>

      <main style={styles.main}>
        <HealthCheck />
      </main>

      <footer style={styles.footer}>
        <p>
          Built with React 19, FastAPI, and PostgreSQL |{' '}
          <a href="/api/docs" style={styles.link} target="_blank" rel="noopener noreferrer">
            API Docs
          </a>
        </p>
      </footer>
    </div>
  )
}

const styles = {
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '2rem',
    textAlign: 'center' as const,
  },
  headerTitle: {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    margin: '0.5rem 0 0',
    fontSize: '1.125rem',
    color: '#9ca3af',
  },
  main: {
    minHeight: 'calc(100vh - 300px)',
    padding: '2rem 1rem',
  },
  footer: {
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    padding: '1.5rem',
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
}

export default App
