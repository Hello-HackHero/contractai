import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  FileText, 
  Upload as UploadIcon, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  LogOut 
} from 'lucide-react'

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'US'
  const username = user?.email?.split('@')[0] || 'User'
  const isPro = profile?.subscription === 'pro'

  const navLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '#contracts-section', label: 'My Contracts', icon: FileText, isScroll: true },
    { to: '/upload', label: 'Upload New', icon: UploadIcon },
    { to: '#chat-section', label: 'Chat with Contract', icon: MessageSquare, isScroll: true },
    { to: '/pricing', label: 'Pricing & Plans', icon: CreditCard },
    { to: '/profile', label: 'Settings', icon: Settings },
  ]

  const handleNavClick = (link) => {
    if (link.isScroll) {
      const element = document.getElementById(link.to.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(link.to)
    }
  }

  return (
    <aside className="bg-white dark:bg-[#091F2E] border-r border-gray-200 dark:border-white/10 font-sans fixed left-0 top-0 h-full w-64 shadow-2xl flex flex-col pt-20 pb-8 z-40 transition-colors duration-200">
      {/* User Profile Section */}
      <div className="flex items-center gap-3 mb-10 px-6">
        <div className="w-10 h-10 rounded-full bg-[#C9A843] flex items-center justify-center text-[#0D2A3E] font-bold shadow-lg shadow-[#C9A843]/10">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-gray-900 dark:text-white font-semibold text-sm truncate w-32">{username}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{isPro ? 'Pro Plan' : 'Free Plan'}</span>
            {!isPro && (
              <Link className="text-[#C9A843] hover:underline" to="/pricing">Upgrade</Link>
            )}
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="space-y-1 flex-1 px-4">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.to && !link.isScroll

          return (
            <button
              key={link.label}
              onClick={() => handleNavClick(link)}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-300 group text-sm w-full text-left ${
                isActive 
                  ? 'border-l-2 border-[#C9A843] text-[#C9A843] bg-[#C9A843]/5 pl-[14px]' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A843]' : 'text-current opacity-70 group-hover:opacity-100'}`} />
              <span>{link.label}</span>
            </button>
          )
        })}
      </div>

      {/* Upgrade Card */}
      {!isPro && (
        <div className="bg-gray-50 dark:bg-[#0B2236] border border-gray-200 dark:border-[#C9A843]/40 rounded-xl p-4 mx-3 mb-4">
          <p className="text-gray-900 dark:text-white font-bold text-sm">Upgrade to Pro</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">₹499/month • 25 contracts</p>
          <button 
            onClick={() => navigate('/pay-pro')}
            className="w-full mt-3 py-2 bg-[#C9A843] text-[#0D2A3E] font-bold text-sm rounded-lg hover:bg-[#b8933a] transition-all"
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 px-4">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 px-4 transition-all w-full text-left text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
