import { Link } from 'react-router-dom'
import { FileText, Github, Twitter, Mail } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold gradient-text">ContractAI</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                            AI-powered contract analysis that helps you understand legal documents in minutes, not hours. Stay protected with smart risk detection.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><Link to="/pricing" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</Link></li>
                            <li><Link to="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Dashboard</Link></li>
                            <li><Link to="/upload" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Upload Contract</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</a></li>
                            <li><a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} ContractAI. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
