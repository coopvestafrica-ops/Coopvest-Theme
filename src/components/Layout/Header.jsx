import React from 'react'
import { Moon, Sun, Bell, User, Settings } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const { darkMode, toggleDarkMode } = useUIStore()
  const { user, role } = useAuthStore()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - empty for mobile menu space */}
        <div className="hidden lg:block" />

        {/* Right side - actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-neutral-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                {role?.replace('_', ' ')}
              </p>
            </div>
            <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
