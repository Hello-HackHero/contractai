import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Crown, 
  BarChart3, 
  LogOut, 
  Check, 
  X, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  MessageCircle,
  FileText
} from 'lucide-react'

export default function Profile() {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const isPro = profile?.subscription === 'pro'
    const used = profile?.analyses_used || 0
    const limit = isPro ? 25 : 3
    const remaining = Math.max(0, limit - used)
    const usagePct = Math.min(100, (used / limit) * 100)

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    const initials = user?.email?.[0]?.toUpperCase() || 'U'

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0D2A3E] pt-24 pb-12 transition-colors duration-200">
            <div className="max-w-2xl mx-auto px-4">
                
                {/* SECTION 1 — Profile Card */}
                <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#C9A843] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#C9A843]/20">
                                {initials}
                            </div>
                            <div>
                                <h1 className="text-gray-900 dark:text-white font-bold text-lg leading-tight">{user?.email}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    {isPro ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-[#C9A843] border border-amber-200 dark:border-[#C9A843]/30">
                                            ⭐ Pro Plan
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                                Free Plan
                                            </span>
                                            <Link to="/pricing" className="text-[#C9A843] text-xs font-bold hover:underline flex items-center gap-0.5">
                                                Upgrade <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2 — Usage Stats Card */}
                <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-[#C9A843]" />
                        <h2 className="text-gray-900 dark:text-white font-bold">This Month's Usage</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Contracts Analysed</span>
                            <span className="text-sm font-bold text-[#C9A843]">{used} / {limit}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-[#C9A843] h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                                style={{ width: `${usagePct}%` }}
                            />
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 text-xs italic">
                            {remaining} analyses remaining this month
                        </p>
                    </div>
                </div>

                {/* SECTION 3 — Plan Details Card */}
                <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#C9A843]" />
                            <h2 className="text-gray-900 dark:text-white font-bold">Current Plan Details</h2>
                        </div>
                        {isPro && (
                            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20 uppercase tracking-wider">
                                Active
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <FeatureItem checked={true} label={`${isPro ? '25' : '3'} contracts / month`} />
                        <FeatureItem checked={true} label="Basic risk scoring" />
                        <FeatureItem checked={isPro} label="AI Contract Chat" />
                        <FeatureItem checked={isPro} label="PDF Reports" />
                        <FeatureItem checked={isPro} label="Priority Support" />
                        <FeatureItem checked={isPro} label="Bulk Analysis" />
                    </div>

                    {!isPro && (
                        <div className="bg-[#C9A843]/10 border border-[#C9A843]/30 rounded-xl p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[#C9A843] font-bold">Upgrade to Pro — ₹499/month</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                        Unlock 25 contracts, chat, reports & more
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate('/pay-pro')}
                                    className="px-6 py-2.5 bg-[#C9A843] text-[#0D2A3E] font-bold rounded-lg hover:bg-[#b8933a] transition-all shadow-lg shadow-[#C9A843]/10 whitespace-nowrap"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 4 — Danger Zone */}
                <div className="bg-white dark:bg-[#0B2236] border border-red-100 dark:border-red-500/10 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-gray-900 dark:text-white font-bold mb-6 flex items-center gap-2">
                        Account Settings
                    </h2>
                    <button 
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-6 py-3 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all w-full sm:w-auto font-semibold text-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

            </div>
        </div>
    )
}

function FeatureItem({ checked, label }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <div className="w-5 h-5 rounded-full bg-[#C9A843]/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-[#C9A843]" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
          <X className="w-3 h-3 text-gray-400" />
        </div>
      )}
      <span className={`text-sm ${checked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}
