import { StrictMode, useEffect } from 'react'
import ReactGA from './reactGA.js'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { LanguageProvider } from './LanguageContext.jsx'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'

export default function AppIsland() {
  useEffect(() => {
    ReactGA.initialize(GA_MEASUREMENT_ID)
  }, [])

  return (
    <StrictMode>
      <LanguageProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </LanguageProvider>
    </StrictMode>
  )
}
