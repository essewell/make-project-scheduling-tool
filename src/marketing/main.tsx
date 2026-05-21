import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/reset.css'
import './marketing.css'
import { MarketingPage } from './MarketingPage'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <MarketingPage />
  </StrictMode>,
)
