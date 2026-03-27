import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Download, ChevronRight, AlertCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import RiskScoreCircle from '../components/RiskScoreCircle'
import ChatSection from '../components/ChatSection'

// ── Clause Component for each risk level ─────────────────────────────────────

function ClauseCard({ title, severity, text, explanation, recommendation, type }) {
    const config = {
        high_risk: { border: 'border-red-500', icon: 'bg-red-500', badge: 'bg-red-500/20 text-red-400', label: 'HIGH RISK' },
        medium_risk: { border: 'border-amber-500', icon: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400', label: 'MEDIUM RISK' },
        low_risk: { border: 'border-emerald-500', icon: 'bg-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400', label: 'LOW RISK' }
    }
    const c = config[type] || config.medium_risk

    return (
        <div className={`border-l-4 ${c.border} bg-white dark:bg-[#0B2236] p-4 rounded-r-lg mb-3 shadow-sm dark:shadow-none`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.icon}`} />
                    <span className="text-gray-900 dark:text-white font-semibold">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Severity: {severity}/10</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${c.badge} font-semibold`}>
                        {c.label}
                    </span>
                </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{text}</p>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">⚠️ {explanation}</p>
            <p className="text-[#C9A843] text-xs">💡 {recommendation}</p>
        </div>
    )
}

export default function Results() {
    const { id } = useParams()
    const { profile, session } = useAuth()
    const [contract, setContract] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [downloading, setDownloading] = useState(false)

    const isPro = profile?.subscription === 'pro'

    useEffect(() => {
        fetchContract()
    }, [id])

    const fetchContract = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error: dbErr } = await supabase.from('contracts').select('*').eq('id', id).single()
            if (dbErr) throw dbErr
            setContract(data)
        } catch (err) {
            setError(err.message || 'Failed to load contract')
        }
        setLoading(false)
    }

    const handleDownloadPDF = async () => {
        if (!isPro) return
        setDownloading(true)
        try {
            const res = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ contractId: id }),
            })
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `SamvidAI_Report.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) { console.error('Download failed:', err) }
        setDownloading(false)
    }

    // 8. LOADING STATE
    if (loading) return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0D2A3E] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#C9A843] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-900 dark:text-white font-semibold">Loading analysis...</p>
            </div>
        </div>
    )

    // 9. ERROR STATE
    if (error) return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0D2A3E] flex items-center justify-center">
            <div className="text-center px-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-red-500 text-xl font-bold mb-2">Failed to load analysis</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{error}</p>
                <Link to="/dashboard" className="inline-block px-8 py-3 bg-[#C9A843] text-[#0D2A3E] rounded-xl font-bold hover:opacity-90 transition-all">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )

    if (!contract) return (
        <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0D2A3E] flex items-center justify-center">
            <p className="text-gray-900 dark:text-white text-xl font-semibold">Contract not found.</p>
        </div>
    )

    const data = contract.analysis_result || {}
    const riskScore = data.overall_risk_score || 0
    const riskLevelText = `${data.risk_level || 'UNKNOWN'} RISK`
    
    // Risk Score Badge Colors
    const getRiskColor = (score) => {
        if (score < 40) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        if (score < 70) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        return 'bg-red-500/20 text-red-400 border-red-500/30'
    }

    return (
        <div className="page-container pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Link to="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-[#C9A843] text-sm mb-2 inline-block">← Back to Dashboard</Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{contract.file_name}</h1>
                    {/* 2. CONTRACT TYPE BADGE */}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#C9A843] text-[#C9A843]">
                        {data.contract_type} Contract
                    </span>
                </div>
                {isPro && (
                    <button onClick={handleDownloadPDF} disabled={downloading} className="gradient-btn-outline flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        {downloading ? 'Downloading...' : 'Download Report'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 1. RISK GAUGE */}
                    <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="flex flex-col items-center">
                            <RiskScoreCircle score={riskScore} size={160} strokeWidth={12} />
                            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(riskScore)}`}>
                                {riskLevelText}
                            </span>
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Analysis Stats</h2>
                            
                            {/* 3. STATS ROW */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                                    {data.total_clauses_analysed} Clauses Analysed
                                </span>
                                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    {data.red_flags?.length || 0} Red Flags
                                </span>
                                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    {data.clauses?.high_risk?.length || 0} High Risk
                                </span>
                                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 text-gray-500 border border-white/10 scale-95">
                                    {data.chunks_processed || 1} Chunks Processed
                                </span>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                Our AI has evaluated this contract as {data.risk_level?.toLowerCase()} risk. Below is a detailed breakdown of identified clauses and potential legal concerns.
                            </p>
                        </div>
                    </div>

                    {/* 4. CLAUSE CARDS */}
                    <div className="space-y-4">
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4">Categorized Clauses</h3>
                        
                        {/* High Risk */}
                        {data.clauses?.high_risk?.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">High Risk Clauses</h4>
                                {data.clauses.high_risk.map((clause, i) => (
                                    <ClauseCard key={i} {...clause} type="high_risk" />
                                ))}
                            </div>
                        )}

                        {/* Medium Risk */}
                        {data.clauses?.medium_risk?.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">Medium Risk Clauses</h4>
                                {data.clauses.medium_risk.map((clause, i) => (
                                    <ClauseCard key={i} {...clause} type="medium_risk" />
                                ))}
                            </div>
                        )}

                        {/* Low Risk */}
                        {data.clauses?.low_risk?.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">Low Risk Clauses</h4>
                                {data.clauses.low_risk.map((clause, i) => (
                                    <ClauseCard key={i} {...clause} type="low_risk" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="lg:col-span-4 space-y-6">
                    {/* 7. SUMMARY CARD */}
                    <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 shadow-sm rounded-lg p-4 mb-4">
                        <h3 className="text-[#C9A843] text-sm font-semibold uppercase tracking-wider mb-2">Contract Summary</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {data.summary}
                        </p>
                    </div>

                    {/* 5. RED FLAGS SECTION */}
                    <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 shadow-sm rounded-lg p-4 mt-4">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <span className="text-red-400">🚩</span> Red Flags
                        </h3>
                        {data.red_flags?.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                                <span className="text-red-400 mt-0.5">•</span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">{flag}</span>
                            </div>
                        ))}
                    </div>

                    {/* 6. RECOMMENDATIONS SECTION */}
                    <div className="bg-white dark:bg-[#0B2236] border border-[#C9A843]/30 rounded-lg p-4 mt-4 shadow-sm">
                        <h3 className="text-gray-900 dark:text-white font-bold mb-3 flex items-center gap-2">
                            <span>💡</span> Recommended Actions
                        </h3>
                        {data.recommendations?.map((rec, i) => (
                            <div key={i} className="flex items-start gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-white/10 last:border-0">
                                <span className="text-[#C9A843] font-bold min-w-[20px]">{i + 1}.</span>
                                <span className="text-gray-600 dark:text-gray-300 text-sm">{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── MODEL USED BADGE ── */}
            {data.modelUsed && (
                <p className="text-center text-gray-600 dark:text-gray-500 text-xs mt-8">
                    ⚡ Analysed by: 
                    <span className={`ml-1 font-bold ${
                        data.modelUsed === 'HuggingFace' 
                            ? 'text-[#C9A843]' 
                            : 'text-blue-400'
                    }`}>
                        {data.modelUsed === 'HuggingFace' 
                            ? '🤗 SamvidAI Custom Model' 
                            : '⚡ Groq Fallback'}
                    </span>
                </p>
            )}

            {/* ── CHAT SECTION ── */}
            <ChatSection contractId={id} contractData={data} />
        </div>
    )
}
