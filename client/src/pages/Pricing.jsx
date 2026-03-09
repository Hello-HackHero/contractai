import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Check, Zap, Star, X, Shield, Download, Infinity } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
}

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: '/forever',
        description: 'For individuals trying it out',
        features: [
            '2 contract analyses per month',
            'Risk score overview',
            'Summary preview',
            'Email support',
        ],
        limitations: [
            'No full risk report',
            'No PDF download',
            'No safer alternatives',
        ],
        featured: false,
    },
    {
        name: 'Pro',
        price: '₹299',
        period: '/month',
        description: 'For professionals and small teams',
        features: [
            'Unlimited contract analyses',
            'Complete risk reports',
            'Safer clause alternatives',
            'Downloadable PDF reports',
            'Priority email support',
            'All future features included',
        ],
        limitations: [],
        featured: true,
    },
]

const proFeatures = [
    { icon: <Infinity className="w-4 h-4" />, text: 'Unlimited contract analyses' },
    { icon: <Shield className="w-4 h-4" />, text: 'Full risk reports & clause details' },
    { icon: <Check className="w-4 h-4" />, text: 'Safer clause alternatives' },
    { icon: <Download className="w-4 h-4" />, text: 'Downloadable PDF reports' },
]

export default function Pricing() {
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [paying, setPaying] = useState(false)
    const [success, setSuccess] = useState(false)

    const isPro = profile?.subscription === 'pro'

    const handleUpgradeClick = () => {
        if (!user) {
            navigate('/signup')
            return
        }
        setShowModal(true)
        setSuccess(false)
    }

    const handleConfirmPayment = async () => {
        setPaying(true)
        // Simulate payment processing delay
        await new Promise(res => setTimeout(res, 2000))

        try {
            await supabase
                .from('profiles')
                .update({ subscription: 'pro' })
                .eq('id', user.id)

            await refreshProfile()
            setSuccess(true)

            // Redirect to dashboard after showing success
            setTimeout(() => {
                setShowModal(false)
                navigate('/dashboard')
            }, 2000)
        } catch (err) {
            console.error('Payment error:', err)
        }
        setPaying(false)
    }

    return (
        <div className="page-container">
            <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-purple-950/20 -z-10" />

            <div className="max-w-5xl mx-auto">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={0}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
                        <Star className="w-4 h-4" /> Simple Pricing
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your <span className="gradient-text">Plan</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
                        Start with free analyses and upgrade when you need the full picture.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={i + 1}
                        >
                            <GlassCard className={`h-full relative ${plan.featured ? 'border-primary-500/50 dark:border-primary-500/30 shadow-primary-500/10 shadow-2xl' : ''}`}>
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                                        RECOMMENDED
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        {plan.featured && <Zap className="w-5 h-5 text-amber-500" />}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                                </div>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                    <span className="ml-1 text-gray-400">{plan.period}</span>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.featured ? 'text-primary-500' : 'text-success-500'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {plan.limitations.length > 0 && (
                                    <ul className="space-y-2 mb-8 pt-4 border-t border-gray-100 dark:border-dark-border">
                                        {plan.limitations.map(l => (
                                            <li key={l} className="flex items-start gap-3 text-sm text-gray-400">
                                                <span className="w-4 text-center flex-shrink-0">—</span>
                                                {l}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {plan.featured ? (
                                    isPro ? (
                                        <button disabled className="w-full gradient-btn opacity-60 cursor-not-allowed">
                                            ✓ Current Plan (Pro)
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleUpgradeClick}
                                            className="w-full gradient-btn flex items-center justify-center gap-2"
                                        >
                                            Upgrade to Pro
                                        </button>
                                    )
                                ) : (
                                    <button disabled className="w-full gradient-btn-outline opacity-60 cursor-default">
                                        {isPro ? 'Free Tier' : 'Current Plan'}
                                    </button>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="mt-16 text-center"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={4}
                >
                    <GlassCard className="max-w-2xl mx-auto">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Questions?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            All plans include core AI analysis. Pro unlocks detailed reports, safer alternatives, PDF downloads, and unlimited usage. Cancel anytime — no hidden fees.
                        </p>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Mock Payment Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => !paying && setShowModal(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            className="relative w-full max-w-md"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.4 }}
                        >
                            <GlassCard className="p-0 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-6 text-white relative">
                                    {!paying && (
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3 mb-1">
                                        <Zap className="w-6 h-6 text-amber-300" />
                                        <h2 className="text-xl font-bold">Upgrade to ContractAI Pro</h2>
                                    </div>
                                    <p className="text-white/70 text-sm">Unlock the full power of AI contract analysis</p>
                                </div>

                                <div className="p-6">
                                    {success ? (
                                        <motion.div
                                            className="text-center py-6"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            <div className="text-5xl mb-4">🎉</div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                Payment Successful!
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                You are now a Pro user! Redirecting to dashboard...
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {/* Price */}
                                            <div className="flex items-baseline gap-1 mb-6">
                                                <span className="text-4xl font-bold text-gray-900 dark:text-white">₹299</span>
                                                <span className="text-gray-400">/month</span>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-3 mb-6">
                                                {proFeatures.map((f, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0">
                                                            {f.icon}
                                                        </span>
                                                        {f.text}
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Confirm Button */}
                                            <button
                                                onClick={handleConfirmPayment}
                                                disabled={paying}
                                                className="w-full gradient-btn flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {paying ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Confirm Payment (Demo)'
                                                )}
                                            </button>

                                            <p className="text-center text-xs text-gray-400 mt-3">
                                                🔒 This is a demo payment for testing purposes
                                            </p>
                                        </>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
