import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

function initTheme() {
  const root = document.documentElement
  const stored = localStorage.getItem('bldlab-theme')
  if (stored === 'light' || stored === 'dark') {
    root.dataset.theme = stored
    return
  }
  root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
initTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)