import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import './index.css'

// Telegram Mini App — инициализация и safe area insets
const tg = window.Telegram?.WebApp
if (tg) {
  tg.ready()
  tg.expand()

  const applyInsets = () => {
    const top = tg.safeAreaInset?.top ?? 0
    const contentTop = tg.contentSafeAreaInset?.top ?? 0
    document.documentElement.style.setProperty('--tg-safe-area-inset-top', `${top}px`)
    document.documentElement.style.setProperty('--tg-content-safe-area-inset-top', `${contentTop}px`)
  }

  applyInsets()
  tg.onEvent('safeAreaChanged', applyInsets)
  tg.onEvent('contentSafeAreaChanged', applyInsets)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
