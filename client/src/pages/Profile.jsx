import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Crown, BarChart3, LogOut, CreditCard } from 'lucide-react'
import GlassCard from '../components/GlassCard'

export default function Profile() {
    const { user, profile, signOut } = useAuth()
    const navigate = useNavigate()

    const isPro = profile?.subscription === 'pro'
    const analysesUsed = profile?.analyses_used || 0
    const maxAnalyses = isPro ? '∞' : 2

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="page-container">
            <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-purple-950/20 -z-10" />

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>

                {/* Avatar & Name */}
                <GlassCard className="mb-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Plan Status */}
                <GlassCard className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Subscription</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPro ? 'bg-amber-500/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                                {isPro ? <Crown className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {isPro ? 'Pro Plan' : 'Free Plan'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {isPro ? '₹299/month • Unlimited analyses' : '2 analyses/month'}
                                </p>
                            </div>
                        </div>
                        {!isPro && (
                            <a href="/pricing" className="gradient-btn text-sm !py-2 !px-4">
                                Upgrade
                            </a>
                        )}
                    </div>
                </GlassCard>

                {/* Usage */}
                <GlassCard className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Usage This Month</h2>
                    <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {analysesUsed} / {maxAnalyses}
                        </span>
                        <span className="text-sm text-gray-400">analyses used</span>
                    </div>
                    {!isPro && (
                        <div className="w-full bg-gray-100 dark:bg-dark-border rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${Math.min((analysesUsed / 2) * 100, 100)}%` }}
                            />
                        </div>
                    )}
                </GlassCard>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-danger-500 hover:border-danger-200 dark:hover:border-danger-500/20 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
