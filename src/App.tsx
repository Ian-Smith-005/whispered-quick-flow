
import { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {
    // Redirect to the static HTML landing page
    window.location.href = '/index.html'
  }, [])

  return (
    <div className="App" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Nunito, sans-serif'
    }}>
      <p>Redirecting to Diacare...</p>
    </div>
  )
}

export default App
