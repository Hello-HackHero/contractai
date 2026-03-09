import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Upload, FileText, BarChart3, Clock, Zap, TrendingUp } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import RiskScoreCircle from '../components/RiskScoreCircle'

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContracts()
    }, [user])

    const fetchContracts = async () => {
        if (!user) return
        const { data } = await supabase
            .from('contracts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setContracts(data || [])
        setLoading(false)
    }

    const analysesUsed = profile?.analyses_used || 0
    const maxAnalyses = profile?.subscription === 'pro' ? '∞' : 2
    const isPro = profile?.subscription === 'pro'

    const stats = [
        {
            label: 'Contracts Analyzed',
            value: contracts.length,
            icon: <FileText className="w-5 h-5" />,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Analyses This Month',
            value: `${analysesUsed}/${maxAnalyses}`,
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: 'Current Plan',
            value: isPro ? 'Pro' : 'Free',
            icon: <Zap className="w-5 h-5" />,
            color: isPro ? 'from-amber-500 to-orange-500' : 'from-gray-400 to-gray-500',
        },
        {
            label: 'Avg Risk Score',
            value: contracts.length > 0
                ? Math.round(contracts.reduce((sum, c) => sum + (c.risk_score || 0), 0) / contracts.length)
                : '—',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'from-emerald-500 to-teal-500',
        },
    ]

    const getRiskColor = (score) => {
        if (score < 40) return 'text-success-500 bg-success-500/10'
        if (score < 70) return 'text-yellow-500 bg-yellow-500/10'
        return 'text-danger-500 bg-danger-500/10'
    }

    return (
        <div className="page-container">
            <div className="section-container">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
                        </p>
                    </div>
                    <Link to="/upload" className="gradient-btn flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Contract
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <GlassCard key={stat.label} className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Usage Warning */}
                {!isPro && analysesUsed >= 2 && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            You've used all your free analyses this month.{' '}
                            <Link to="/pricing" className="font-semibold underline">Upgrade to Pro</Link> for unlimited access.
                        </p>
                    </div>
                )}

                {/* Upload Quick Action */}
                <GlassCard className="mb-8 border-dashed !border-2">
                    <Link to="/upload" className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload a New Contract</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Drag & drop or click to upload PDF/DOCX files for instant AI analysis
                            </p>
                        </div>
                    </Link>
                </GlassCard>

                {/* Contract History */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Analysis History</h2>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading...</div>
                    ) : contracts.length === 0 ? (
                        <GlassCard className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No contracts analyzed yet.</p>
                            <Link to="/upload" className="gradient-btn mt-4 inline-block">Upload Your First Contract</Link>
                        </GlassCard>
                    ) : (
                        <div className="space-y-3">
                            {contracts.map((contract) => (
                                <Link key={contract.id} to={`/results/${contract.id}`}>
                                    <GlassCard hover className="flex items-center justify-between !p-4 mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{contract.file_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(contract.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {contract.risk_score !== null && (
                                            <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${getRiskColor(contract.risk_score)}`}>
                                                {contract.risk_score}/100
                                            </div>
                                        )}
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
