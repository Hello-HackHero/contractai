import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('contractai-theme')
            if (stored) return stored === 'dark'
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return false
    })

    useEffect(() => {
        const root = document.documentElement
        if (darkMode) {
            root.classList.add('dark')
            localStorage.setItem('contractai-theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('contractai-theme', 'light')
        }
    }, [darkMode])

    const toggleDarkMode = () => setDarkMode(prev => !prev)

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}
