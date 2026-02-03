import React, { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useUIStore } from '../../store/uiStore'

export default function MainLayout({ children }) {
  const { darkMode } = useUIStore()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Sidebar />
      <Header />
      <main className="pt-16 lg:pl-64 pb-8">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
