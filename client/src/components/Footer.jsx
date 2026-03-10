import { Link } from 'react-router-dom'
import { FileText, Twitter, Github, User, Heart, Star } from 'lucide-react'

// Instagram SVG icon (not in lucide-react)
function InstagramIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    )
}

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Left - About ContractAI */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold gradient-text">ContractAI</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            AI-powered legal contract analysis for everyone
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            Simplifying complex legal contracts using AI and NLP technology
                        </p>
                    </div>

                    {/* Middle - Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/upload" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Upload Contract
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Right - Connect */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Connect</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-primary-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Built by Siddhartha Mishra</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.instagram.com/sidd.hartha_/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors"
                                aria-label="Instagram"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
                                    <InstagramIcon className="w-4.5 h-4.5" />
                                </div>
                            </a>
                            <a
                                href="https://x.com/Tusharlenk82842"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 text-gray-400 hover:text-sky-500 transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                                    <Twitter className="w-4.5 h-4.5" />
                                </div>
                            </a>
                            <a
                                href="https://github.com/Hello-HackHero/contractai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                aria-label="GitHub"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-500/10 transition-colors">
                                    <Github className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-xs font-medium">Source Code</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-dark-border flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; 2026 ContractAI. Developed by Siddhartha Mishra. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> using React, Supabase, and Groq AI
                    </p>
                    <a
                        href="https://github.com/Hello-HackHero/contractai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all"
                    >
                        <Star className="w-3.5 h-3.5" />
                        Star us on GitHub
                    </a>
                </div>
            </div>
        </footer>
    )
}
