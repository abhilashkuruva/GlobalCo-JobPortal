import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}
