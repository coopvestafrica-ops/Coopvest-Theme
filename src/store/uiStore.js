import { create } from 'zustand'

export const useUIStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.darkMode
      localStorage.setItem('darkMode', newDarkMode)
      if (newDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { darkMode: newDarkMode }
    })
  },
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
