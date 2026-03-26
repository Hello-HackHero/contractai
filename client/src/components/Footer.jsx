import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import SamvidLogo from './SamvidLogo'

export default function Footer() {
    const { darkMode } = useTheme()
    return (
        <footer className="bg-[#F4F6F9] dark:bg-[#091F2E] border-t border-gray-200 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
                    {/* Left - Logo + subtext */}
                    <div>
                        <img 
                            src={darkMode ? "/samvid-logo-dark.png" : "/samvid-logo-light.png"}
                            alt="SamvidAI"
                            className="h-9 w-auto mb-3 object-contain"
                        />
                        <p className="text-sm text-gray-400 leading-relaxed">
                            AI-powered contract analysis.
                        </p>
                    </div>

                    {/* Center - Links */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        <Link to="/terms" className="text-sm text-gray-400 hover:text-[#C9A843] transition-colors">
                            Privacy Policy
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link to="/terms" className="text-sm text-gray-400 hover:text-[#C9A843] transition-colors">
                            Terms
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link to="/#contact" className="text-sm text-gray-400 hover:text-[#C9A843] transition-colors">
                            Contact
                        </Link>
                        <span className="text-gray-600">·</span>
                        <Link to="/" className="text-sm text-gray-400 hover:text-[#C9A843] transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Right - Copyright */}
                    <div className="text-right">
                        <p className="text-sm text-gray-500">
                            &copy; 2026 SamvidAI. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
