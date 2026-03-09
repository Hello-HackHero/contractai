import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
    Download, Lock, AlertTriangle, Shield, FileText, RefreshCw,
    ChevronRight, Users, Calendar, CreditCard, CheckCircle2,
    Lightbulb, BookOpen
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import RiskScoreCircle from '../components/RiskScoreCircle'
import Spinner from '../components/Spinner'

const tabs = [
    { id: 'summary', label: 'Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'risky', label: 'Risky Clauses', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'full', label: 'Full Analysis', icon: <Shield className="w-4 h-4" /> },
    { id: 'alternatives', label: 'Alternatives', icon: <RefreshCw className="w-4 h-4" /> },
]

export default function Results() {
    const { id } = useParams()
    const { user, profile, session, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [contract, setContract] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('summary')
    const [downloading, setDownloading] = useState(false)

    const isPro = profile?.subscription === 'pro'

    useEffect(() => { fetchContract() }, [id])

    const fetchContract = async () => {
        const { data } = await supabase.from('contracts').select('*').eq('id', id).single()
        setContract(data)
        setLoading(false)
    }

    // Debug: log analysis_result so we can verify data in console
    useEffect(() => {
        if (contract?.analysis_result) {
            console.log('📋 analysis_result:', contract.analysis_result)
        }
    }, [contract])

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
            a.download = `ContractAI_Report_${contract?.file_name || 'report'}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch (err) { console.error('Download failed:', err) }
        setDownloading(false)
    }

    // Simple mock payment via confirm dialog
    const handleMockPayment = async () => {
        const ok = window.confirm('Upgrade to ContractAI Pro for ₹299/month?\n\nThis is a demo payment for testing purposes.')
        if (!ok) return
        try {
            await supabase.from('profiles').update({ subscription: 'pro' }).eq('id', user.id)
            if (refreshProfile) await refreshProfile()
            alert('🎉 Payment Successful! You are now a Pro user!')
            window.location.reload()
        } catch (err) {
            console.error('Payment error:', err)
            alert('Payment failed. Please try again.')
        }
    }

    if (loading) return (
        <div className="page-container flex items-center justify-center min-h-screen">
            <Spinner text="Loading analysis..." />
        </div>
    )

    if (!contract) return (
        <div className="page-container flex items-center justify-center min-h-screen">
            <GlassCard className="text-center p-10">
                <p className="text-gray-500 dark:text-gray-400">Contract not found.</p>
                <Link to="/dashboard" className="gradient-btn mt-4 inline-block">Go to Dashboard</Link>
            </GlassCard>
        </div>
    )

    // ── Safe data extraction from analysis_result ────────────────────────────
    const ar = contract?.analysis_result ?? {}

    const summary = ar?.simplified_summary || ar?.summary || 'No summary available.'
    const overallAssessment = ar?.overall_assessment ?? ''
    const riskyClauses = ar?.risky_clauses ?? []
    const breakdown = ar?.clause_breakdown ?? []
    const obligations = ar?.obligations ?? []
    const termination = ar?.termination_conditions ?? []
    const keyParties = ar?.key_parties ?? []
    const keyDates = ar?.key_dates ?? []
    const paymentTerms = ar?.payment_terms ?? null
    const recommendations = ar?.recommendations ?? []

    // Build alternatives: prefer safer_alternative from risky_clauses, fallback to legacy alternatives array
    const altFromClauses = riskyClauses
        .filter(c => c?.safer_alternative)
        .map(c => ({ title: c.title, original: c.text || c.description || '', suggested: c.safer_alternative }))
    const legacyAlts = ar?.alternatives ?? []
    const allAlternatives = [...altFromClauses, ...legacyAlts]

    // Paywall wrapper: Pro sees content, free sees blurred + upgrade button
    const renderPaywall = (content) => {
        if (isPro) return content
        return (
            <div className="relative">
                <div className="filter blur-md select-none pointer-events-none opacity-50">{content}</div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-dark-bg/70 backdrop-blur-sm rounded-xl">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Unlock Full Report</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                            Upgrade to Pro to access complete analysis, clause breakdowns, and safer alternatives.
                        </p>
                        <button onClick={handleMockPayment} className="gradient-btn inline-flex items-center gap-2">
                            Unlock for ₹299/mo <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-primary-500 transition-colors mb-2 inline-block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{contract.file_name}</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Analyzed on {new Date(contract.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    {isPro && (
                        <button onClick={handleDownloadPDF} disabled={downloading}
                            className="gradient-btn-outline flex items-center gap-2 text-sm">
                            <Download className="w-4 h-4" />
                            {downloading ? 'Generating...' : 'Download PDF'}
                        </button>
                    )}
                </div>

                {/* Risk Score Card */}
                <GlassCard className="mb-8 flex flex-col sm:flex-row items-center gap-6">
                    <RiskScoreCircle score={contract.risk_score || 0} />
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Risk Assessment</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {typeof summary === 'string' ? summary.substring(0, 220) + (summary.length > 220 ? '...' : '') : 'Analysis complete.'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                {riskyClauses.length} Risky Clause{riskyClauses.length !== 1 ? 's' : ''}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                {allAlternatives.length} Alternative{allAlternatives.length !== 1 ? 's' : ''}
                            </span>
                            {breakdown.length > 0 && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    {breakdown.length} Clauses Analyzed
                                </span>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ═══════════════════ TAB CONTENT ═══════════════════ */}
                <div className="animate-fade-in">

                    {/* ── SUMMARY TAB ── */}
                    {activeTab === 'summary' && (
                        <div className="space-y-4">
                            <GlassCard>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Contract Summary</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                {overallAssessment && (
                                    <div className="mt-4 p-3 rounded-lg bg-primary-500/5 border border-primary-500/10">
                                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">Overall Assessment</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{overallAssessment}</p>
                                    </div>
                                )}
                            </GlassCard>

                            {/* Quick-glance metadata */}
                            {(keyParties.length > 0 || keyDates.length > 0 || paymentTerms) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {keyParties.length > 0 && (
                                        <GlassCard>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users className="w-4 h-4 text-primary-500" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Key Parties</h4>
                                            </div>
                                            <ul className="space-y-1">
                                                {keyParties.map((p, i) => (
                                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />{p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </GlassCard>
                                    )}
                                    {keyDates.length > 0 && (
                                        <GlassCard>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Calendar className="w-4 h-4 text-purple-500" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Key Dates</h4>
                                            </div>
                                            <ul className="space-y-1">
                                                {keyDates.map((d, i) => (
                                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />{d}
                                                    </li>
                                                ))}
                                            </ul>
                                        </GlassCard>
                                    )}
                                    {paymentTerms && (
                                        <GlassCard className="sm:col-span-2" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Payment Terms</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{paymentTerms}</p>
                                        </GlassCard>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── RISKY CLAUSES TAB ── */}
                    {activeTab === 'risky' && (
                        <div className="space-y-4">
                            {riskyClauses.length === 0 ? (
                                <GlassCard><p className="text-gray-500 dark:text-gray-400 text-center py-8">No risky clauses detected.</p></GlassCard>
                            ) : (
                                <>
                                    {(isPro ? riskyClauses : riskyClauses.slice(0, 3)).map((clause, i) => (
                                        <GlassCard key={i}>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-danger-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <AlertTriangle className="w-4 h-4 text-danger-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {clause.title || `Risky Clause ${i + 1}`}
                                                        </h4>
                                                        {clause.severity && (
                                                            <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${clause.severity === 'high' ? 'bg-danger-500/10 text-danger-500' :
                                                                    clause.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                                                                        'bg-success-500/10 text-success-500'
                                                                }`}>
                                                                {clause.severity.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {clause.description || clause.text || JSON.stringify(clause)}
                                                    </p>
                                                    {clause.text && clause.description && (
                                                        <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                                            <p className="text-xs text-gray-400 mb-1">Original clause text:</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{clause.text}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}

                                    {/* Blur overlay for remaining if free */}
                                    {!isPro && riskyClauses.length > 3 && (
                                        <div className="relative">
                                            <div className="filter blur-md select-none pointer-events-none opacity-50 space-y-4">
                                                {riskyClauses.slice(3, 6).map((clause, i) => (
                                                    <GlassCard key={i}>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-danger-500/10 flex items-center justify-center flex-shrink-0">
                                                                <AlertTriangle className="w-4 h-4 text-danger-500" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{clause.title}</h4>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">{clause.description}</p>
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-dark-bg/70 backdrop-blur-sm rounded-xl">
                                                <div className="text-center p-6">
                                                    <Lock className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                                        {riskyClauses.length - 3} more clause{riskyClauses.length - 3 !== 1 ? 's' : ''} hidden
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upgrade to Pro to see all risky clauses.</p>
                                                    <button onClick={handleMockPayment} className="gradient-btn inline-flex items-center gap-2">
                                                        Unlock for ₹299/mo <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── FULL ANALYSIS TAB ── */}
                    {activeTab === 'full' && renderPaywall(
                        <div className="space-y-6">

                            {/* Clause Breakdown */}
                            <GlassCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-primary-500" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clause-by-Clause Breakdown</h3>
                                </div>
                                {breakdown.length > 0 ? (
                                    <div className="space-y-4">
                                        {breakdown.map((item, i) => (
                                            <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                                                    {item.section || item.title || `Section ${i + 1}`}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed ml-8">
                                                    {item.analysis || item.description || JSON.stringify(item)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                                        No clause breakdown available. Re-upload this contract for detailed breakdown.
                                    </p>
                                )}
                            </GlassCard>

                            {/* Obligations */}
                            {obligations.length > 0 && (
                                <GlassCard style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">Key Obligations</h3>
                                    </div>
                                    <ol className="space-y-2">
                                        {obligations.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                                {typeof item === 'string' ? item : JSON.stringify(item)}
                                            </li>
                                        ))}
                                    </ol>
                                </GlassCard>
                            )}

                            {/* Key Parties grid */}
                            {keyParties.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {keyParties.map((party, i) => (
                                        <GlassCard key={i}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Party {i + 1}</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{party}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}

                            {/* Key Dates grid */}
                            {keyDates.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {keyDates.map((date, i) => (
                                        <GlassCard key={i}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-purple-500" />
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{date}</p>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}

                            {/* Termination Conditions */}
                            {termination.length > 0 && (
                                <GlassCard style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">Termination Conditions</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {termination.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                                                {typeof item === 'string' ? item : JSON.stringify(item)}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            )}

                            {/* Payment Terms */}
                            {paymentTerms && (
                                <GlassCard style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="w-5 h-5 text-emerald-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">Payment Terms</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{paymentTerms}</p>
                                </GlassCard>
                            )}

                            {/* Recommendations */}
                            {recommendations.length > 0 && (
                                <GlassCard>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Lightbulb className="w-5 h-5 text-amber-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">Recommendations</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {recommendations.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                                                {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>
                            )}

                            {/* Fallback: JSON dump if nothing else renders */}
                            {breakdown.length === 0 && obligations.length === 0 && termination.length === 0 && recommendations.length === 0 && (
                                <GlassCard>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Raw Analysis Data</h3>
                                    <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 dark:bg-white/5 p-4 rounded-lg overflow-auto max-h-96">
                                        {JSON.stringify(ar, null, 2)}
                                    </pre>
                                </GlassCard>
                            )}
                        </div>
                    )}

                    {/* ── ALTERNATIVES TAB ── */}
                    {activeTab === 'alternatives' && renderPaywall(
                        <div className="space-y-4">
                            {allAlternatives.length === 0 && recommendations.length === 0 ? (
                                <GlassCard>
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No safer alternatives available for this analysis.</p>
                                </GlassCard>
                            ) : (
                                <>
                                    {allAlternatives.length > 0 && (
                                        <>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                Plain-language rewrites of risky clauses to better protect your interests.
                                            </p>
                                            {allAlternatives.map((alt, i) => (
                                                <GlassCard key={i}>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <Shield className="w-4 h-4 text-success-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                                                {alt.title || `Safer Alternative ${i + 1}`}
                                                            </h4>
                                                            {(alt.original || alt.text || alt.description) && (
                                                                <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                                    <p className="text-xs font-semibold text-red-500 mb-1 uppercase tracking-wide">Original (Risky)</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                                        "{alt.original || alt.text || alt.description}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {(alt.suggested || alt.safer_alternative) && (
                                                                <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                                                    <p className="text-xs font-semibold text-emerald-500 mb-1 uppercase tracking-wide">Suggested (Safer)</p>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-200">
                                                                        {alt.suggested || alt.safer_alternative}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            ))}
                                        </>
                                    )}

                                    {/* Recommendations as numbered blue cards */}
                                    {recommendations.length > 0 && (
                                        <>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3 flex items-center gap-2">
                                                <Lightbulb className="w-5 h-5 text-blue-500" /> Recommendations
                                            </h3>
                                            {recommendations.map((rec, i) => (
                                                <GlassCard key={i} style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                    <div className="flex items-start gap-3">
                                                        <span className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 text-sm flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </span>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {typeof rec === 'string' ? rec : JSON.stringify(rec)}
                                                        </p>
                                                    </div>
                                                </GlassCard>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Upgrade CTA for free users at bottom */}
                {!isPro && (
                    <GlassCard className="mt-8 text-center bg-gradient-to-r from-primary-500/5 to-purple-500/5">
                        <Lock className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Want the full report?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Upgrade to Pro for complete clause breakdown, all alternatives, and downloadable PDF reports.
                        </p>
                        <button onClick={handleMockPayment} className="gradient-btn inline-flex items-center gap-2">
                            Upgrade to Pro — ₹299/mo <ChevronRight className="w-4 h-4" />
                        </button>
                    </GlassCard>
                )}
            </div>
        </div>
    )
}
