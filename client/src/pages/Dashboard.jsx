import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Upload, 
  ArrowRight, 
  MessageSquare, 
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ChatSection from '../components/ChatSection'

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchContracts()
    }, [user])

    const fetchContracts = async () => {
        if (!user) return
        try {
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            
            if (error) throw error
            setContracts(data || [])
        } catch (err) {
            console.error('Error fetching contracts:', err)
        } finally {
            setLoading(false)
        }
    }

    const analysesUsed = profile?.analyses_used || 0
    const maxAnalyses = profile?.subscription === 'pro' ? 25 : 3
    const isPro = profile?.subscription === 'pro'

    const riskStats = useMemo(() => {
        const total = contracts.length
        if (total === 0) return { avg: 0, high: 0, medium: 0, low: 0, highPct: 0, medPct: 0, lowPct: 0 }
        
        const sum = contracts.reduce((acc, c) => acc + (c.risk_score || 0), 0)
        const high = contracts.filter(c => (c.risk_score || 0) >= 70).length
        const medium = contracts.filter(c => (c.risk_score || 0) >= 40 && (c.risk_score || 0) < 70).length
        const low = contracts.filter(c => (c.risk_score || 0) < 40).length
        
        return {
            avg: Math.round(sum / total),
            high,
            medium,
            low,
            highPct: Math.round((high / total) * 100),
            medPct: Math.round((medium / total) * 100),
            lowPct: Math.round((low / total) * 100)
        }
    }, [contracts])

    const statsCards = [
        {
            label: 'Total Contracts',
            value: contracts.length,
            icon: <FileText className="w-6 h-6 text-brand-primary" />,
        },
        {
            label: `This Month (${isPro ? 'Pro' : 'Free'})`,
            value: `${analysesUsed}/${maxAnalyses}`,
            icon: <BarChart3 className="w-6 h-6 text-brand-primary" />,
        },
        {
            label: 'Avg Risk Score',
            value: riskStats.avg,
            icon: <ShieldCheck className="w-6 h-6 text-brand-primary" />,
            isHighlight: true
        },
        {
            label: 'Avg Analysis Time',
            value: '2.3 min',
            icon: <Clock className="w-6 h-6 text-brand-primary" />,
        },
    ]

    const getRiskBadge = (score) => {
        if (score >= 70) return { label: 'HIGH', color: 'bg-brand-error text-brand-on-error', bg: 'bg-brand-error/10 text-brand-error' }
        if (score >= 40) return { label: 'MEDIUM', color: 'bg-brand-primary text-brand-on-primary', bg: 'bg-brand-primary/10 text-brand-primary' }
        return { label: 'LOW', color: 'bg-brand-tertiary text-brand-on-tertiary', bg: 'bg-brand-tertiary/10 text-brand-tertiary' }
    }

    if (loading) return (
      <div className="flex min-h-screen bg-[#0D2A3E]">
        {/* Sidebar skeleton */}
        <div className="w-64 bg-[#091F2E] h-screen"/>
        
        {/* Main content skeleton */}
        <div className="flex-1 p-8 pt-24 ml-64">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-36 bg-white/10 rounded-lg animate-pulse mb-2"/>
              <div className="h-4 w-48 bg-white/5 rounded animate-pulse"/>
            </div>
            <div className="h-10 w-40 bg-[#C9A843]/20 rounded-lg animate-pulse"/>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-[#0B2236] rounded-xl p-5 border border-white/10">
                <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse mb-4"/>
                <div className="h-8 w-16 bg-white/10 rounded animate-pulse mb-2"/>
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse"/>
              </div>
            ))}
          </div>
          
          {/* Table skeleton */}
          <div className="bg-[#0B2236] rounded-xl border border-white/10 p-5">
            <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-4"/>
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                <div className="h-4 w-48 bg-white/10 rounded animate-pulse"/>
                <div className="h-6 w-20 bg-[#C9A843]/20 rounded-full animate-pulse"/>
                <div className="h-6 w-12 bg-red-500/20 rounded-full animate-pulse"/>
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse ml-auto"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    )

    const statsCardsData = [
        {
            label: 'Total Contracts',
            value: contracts.length,
            icon: <FileText className="w-5 h-5 text-[#C9A843]" />,
            valColor: 'text-white'
        },
        {
            label: 'This Month',
            value: `${analysesUsed}/${maxAnalyses}`,
            icon: <BarChart3 className="w-5 h-5 text-[#C9A843]" />,
            valColor: 'text-white'
        },
        {
            label: 'Avg Risk Score',
            value: riskStats.avg,
            icon: <ShieldCheck className="w-5 h-5 text-[#C9A843]" />,
            valColor: riskStats.avg > 0 ? 'text-amber-400' : 'text-white'
        },
        {
            label: 'Avg Analysis Time',
            value: '2.3 min',
            icon: <Clock className="w-5 h-5 text-[#C9A843]" />,
            valColor: 'text-white'
        },
    ]

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-[#0D2A3E] text-gray-900 dark:text-white font-sans selection:bg-[#C9A843]/30">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 overflow-y-auto pt-24">
                {/* SECTION 1 — Header */}
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {new Date().toLocaleDateString('en-IN', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                    <Link 
                        to="/upload"
                        className="flex items-center gap-2 bg-[#C9A843] hover:bg-[#b8933a] text-[#0D2A3E] px-6 py-3 rounded-lg font-bold transition-all shadow-lg shadow-[#C9A843]/10"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Contract
                    </Link>
                </header>

                {/* SECTION 2 — 4 Stats Cards */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statsCardsData.map((card, i) => (
                        <div key={i} className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-none hover:border-[#C9A843]/20 transition-all">
                            <div className="w-10 h-10 bg-[#C9A843]/15 rounded-lg flex items-center justify-center mb-4">
                                {card.icon}
                            </div>
                            <div className={`text-2xl font-bold mb-1 ${card.valColor === 'text-white' ? 'text-gray-900 dark:text-white' : card.valColor}`}>
                                {card.value}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{card.label}</div>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-12">
                    {/* SECTION 3 (LEFT) — Recent Contracts (60%) */}
                    <section className="lg:col-span-6" id="contracts-section">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif tracking-tight">Recent Contracts</h2>
                            <button className="text-[#C9A843] font-semibold hover:underline text-sm">View all →</button>
                        </div>
                        
                        <div className="space-y-4">
                            {contracts.length === 0 ? (
                                <div className="bg-[#0B2236] rounded-xl p-12 text-center border border-white/5">
                                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No contracts analyzed yet.</p>
                                </div>
                            ) : (
                                contracts.slice(0, 5).map((contract) => {
                                    const badge = getRiskBadge(contract.risk_score || 0)
                                    return (
                                        <Link 
                                            key={contract.id} 
                                            to={`/results/${contract.id}`}
                                            className="bg-white dark:bg-[#0B2236] rounded-xl p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#0E2A3E] border border-gray-200 dark:border-white/5 hover:border-[#C9A843]/20 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-[#C9A843] transition-colors">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-900 dark:text-white font-medium truncate">{contract.file_name}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="px-2 py-0.5 rounded-full bg-[#C9A843]/10 text-[#C9A843] font-bold tracking-wider uppercase">
                                                        {contract.contract_type || 'CONTRACT'}
                                                    </span>
                                                    <span>
                                                        {new Date(contract.created_at).toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`px-3 py-1 rounded font-bold text-sm ${badge.bg.includes('error') ? 'bg-red-500/20 text-red-500' : badge.bg.includes('primary') ? 'bg-amber-400/20 text-amber-400' : 'bg-green-500/20 text-green-500'}`}>
                                                    {contract.risk_score || 0}
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-[#C9A843] opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </Link>
                                    )
                                })
                            )}
                        </div>
                    </section>

                    {/* SECTION 3 (RIGHT) — Risk Distribution (40%) */}
                    <section className="lg:col-span-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-serif">Risk Distribution</h2>
                        <div className="bg-white dark:bg-[#0B2236] rounded-xl p-6 shadow-sm h-[calc(100%-3rem)] flex flex-col border border-gray-200 dark:border-white/5">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> HIGH RISK
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-xs">{riskStats.high} contracts</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${riskStats.highPct}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-amber-400"></span> MEDIUM RISK
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-xs">{riskStats.medium} contracts</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${riskStats.medPct}%` }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> LOW RISK
                                        </span>
                                        <span className="text-gray-900 dark:text-white font-semibold text-xs">{riskStats.low} contracts</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${riskStats.lowPct}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                                <p className="text-gray-500 text-sm font-medium">{contracts.length} Total Contracts Analysed</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* SECTION 4 — Quick Actions */}
                <section id="actions" className="mb-12">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div 
                          onClick={() => navigate('/upload')}
                          className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-[#C9A843]/50 transition-all duration-200 cursor-pointer hover:shadow-lg dark:hover:shadow-none hover:shadow-[#C9A843]/5 group"
                        >
                            <div className="w-12 h-12 bg-[#C9A843]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-[#C9A843]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload Contract</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Analyse a new PDF or DOCX file using our deep AI model.</p>
                            <button className="border border-[#C9A843] text-[#C9A843] text-sm px-4 py-2 rounded-lg hover:bg-[#C9A843]/10 transition-all mt-4 w-full font-bold">
                                Upload Now
                            </button>
                        </div>

                        <div 
                          onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
                          className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-[#C9A843]/50 transition-all duration-200 cursor-pointer hover:shadow-lg dark:hover:shadow-none hover:shadow-[#C9A843]/5 group"
                        >
                            <div className="w-12 h-12 bg-[#C9A843]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MessageSquare className="w-6 h-6 text-[#C9A843]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chat with Contract</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Ask specific legal questions or request clauses from any document.</p>
                            <button className="border border-[#C9A843] text-[#C9A843] text-sm px-4 py-2 rounded-lg hover:bg-[#C9A843]/10 transition-all mt-4 w-full font-bold">
                                Start Chat
                            </button>
                        </div>

                        <div 
                          onClick={() => {
                            if (contracts.length > 0) {
                              navigate(`/results/${contracts[0].id}`)
                            } else {
                              navigate('/upload')
                            }
                          }}
                          className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:border-[#C9A843]/50 transition-all duration-200 cursor-pointer hover:shadow-lg dark:hover:shadow-none hover:shadow-[#C9A843]/5 group"
                        >
                            <div className="w-12 h-12 bg-[#C9A843]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6 text-[#C9A843]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Risk Reports</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Generate comprehensive risk assessment reports for your contracts.</p>
                            <button className="border border-[#C9A843] text-[#C9A843] text-sm px-4 py-2 rounded-lg hover:bg-[#C9A843]/10 transition-all mt-4 w-full font-bold">
                                View Analysis
                            </button>
                        </div>
                    </div>
                </section>

                {/* AI Chat Support */}
                {contracts && contracts.length > 0 && (
                    <section id="chat-section" className="mt-12 bg-white dark:bg-[#0B2236] rounded-2xl p-6 border border-gray-200 dark:border-white/5">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 font-serif">
                             <Zap className="w-5 h-5 text-[#C9A843]" /> AI Contract Assistant
                        </h2>
                        <ChatSection contracts={contracts} />
                    </section>
                )}
            </main>
        </div>
    )
}
