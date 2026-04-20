import { allDefined, registerIconLibrary } from '@awesome.me/webawesome/dist/webawesome.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './styles/index.css'

// Import Web Awesome components needed by hanko-auth web component
import '@awesome.me/webawesome/dist/components/dropdown/dropdown.js'
import '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js'
import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'

// Import Hanko auth web component
import '@hotosm/hanko-auth'

// Register Bootstrap Icons library for Web Awesome
registerIconLibrary('bootstrap', {
  resolver: (name) => `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`,
})

// Set Hanko URL for authentication (fallback to .test for local dev)
window.HANKO_URL = import.meta.env.VITE_HANKO_URL || 'https://login.hotosm.test'
console.log('🔧 Hanko URL configured:', window.HANKO_URL)

// Ensure all WebAwesome components are loaded before rendering
await allDefined()

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

// add providers here
function Root() {
  return (
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

function AppContent() {
  return <App />
}

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)
root.render(<Root />)
