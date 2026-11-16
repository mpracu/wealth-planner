import { StrictMode } from 'react'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { LanguageProvider } from './LanguageContext.jsx'

export default function AppIsland() {
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
