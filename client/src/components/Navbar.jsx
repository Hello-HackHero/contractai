import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Menu, X, Sun, Moon, FileText, LogOut, User } from 'lucide-react'

export default function Navbar() {
    const { user, profile, signOut } = useAuth()
    const { darkMode, toggleDarkMode } = useTheme()
    const [mobileOpen, setMobileOpen] = useState(false)
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const navLinks = user
        ? [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/upload', label: 'Upload' },
            { to: '/pricing', label: 'Pricing' },
        ]
        : [
            { to: '/pricing', label: 'Pricing' },
        ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text">ContractAI</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="hidden md:flex items-center space-x-2">
                            {user ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                                    >
                                        <User className="w-5 h-5" />
                                        {profile?.subscription === 'pro' && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white leading-none">
                                                PRO
                                            </span>
                                        )}
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-danger-500 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="gradient-btn-outline text-sm !py-2 !px-4">
                                        Log In
                                    </Link>
                                    <Link to="/signup" className="gradient-btn text-sm !py-2 !px-4">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 animate-fade-in">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                                    className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-danger-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex space-x-2 pt-2">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center gradient-btn-outline text-sm !py-2">
                                    Log In
                                </Link>
                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center gradient-btn text-sm !py-2">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
