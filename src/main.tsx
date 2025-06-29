
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
 import './index.css'

// Check if we're on a static HTML page
const isStaticPage = window.location.pathname.includes('.html') || 
                     window.location.pathname === '/login' ||
                     window.location.pathname === '/register' ||
                     window.location.pathname === '/dashboard'

// Only render React app if we're not on a static page
if (!isStaticPage) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
