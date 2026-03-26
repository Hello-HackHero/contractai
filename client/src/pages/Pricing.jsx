import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock, Shield, BarChart3 } from 'lucide-react'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
}

const plans = [
    {
        name: 'Starter',
        description: 'Perfect for individuals',
        price: '₹0',
        period: '/forever',
        features: [
            '3 contracts per month',
            'Basic risk score',
            'PDF support only',
            'Email support',
        ],
        cta: 'Get Started Free',
        featured: false,
    },
    {
        name: 'Professional',
        description: 'For freelancers & small teams',
        price: '₹499',
        period: '/month',
        features: [
            '25 contracts per month',
            'Full risk scoring',
            'PDF + DOCX support',
            'Chat with contract',
            'Download reports',
            'Priority support',
        ],
        cta: 'Get Started — ₹499/mo',
        featured: true,
    },
    {
        name: 'Enterprise',
        description: 'For law firms & large teams',
        price: 'Custom',
        period: '',
        features: [
            'Unlimited contracts',
            'Custom AI model',
            'API access',
            'Team collaboration',
            'Dedicated support',
            'SLA guarantee',
        ],
        cta: 'Contact Sales',
        featured: false,
    },
]

export default function Pricing() {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative pt-32 pb-20 px-4 bg-gradient-to-br from-[#0D2A3E] via-[#112E44] to-[#163D59]">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                    >
                        Simple, <span className="text-[#C9A843]">Transparent Pricing</span>
                    </motion.h1>
                    <motion.p
                        className="text-lg text-gray-300"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                    >
                        No hidden fees. No surprises. Cancel anytime.
                    </motion.p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 px-4 bg-[#F4F6F9] dark:bg-[#091F2E]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                                className={`relative bg-white dark:bg-[#0B2236] border rounded-2xl p-8 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                    plan.featured
                                        ? 'border-[#C9A843] shadow-lg shadow-[#C9A843]/10 scale-[1.02]'
                                        : 'border-gray-200 dark:border-white/10'
                                }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C9A843] text-[#0D2A3E] text-xs font-bold rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                                </div>
                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                    {plan.period && <span className="ml-1 text-gray-400">{plan.period}</span>}
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                            <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-[#C9A843]' : 'text-emerald-500'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {plan.name === 'Professional' ? (
                                    <button
                                        onClick={() => navigate('/pay-pro')}
                                        className={`block text-center w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                            plan.featured
                                                ? 'bg-[#0D2A3E] dark:bg-[#C9A843] hover:bg-[#1B4F72] dark:hover:bg-[#D9B94E] text-white dark:text-[#0D2A3E] shadow-lg'
                                                : 'border-2 border-[#0D2A3E] dark:border-[#C9A843]/50 text-[#0D2A3E] dark:text-[#C9A843] hover:bg-[#0D2A3E]/5 dark:hover:bg-[#C9A843]/10'
                                        }`}
                                    >
                                        {plan.cta}
                                    </button>
                                ) : (
                                    <Link
                                        to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                                        className={`block text-center w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                                            plan.featured
                                                ? 'bg-[#0D2A3E] dark:bg-[#C9A843] hover:bg-[#1B4F72] dark:hover:bg-[#D9B94E] text-white dark:text-[#0D2A3E] shadow-lg'
                                                : 'border-2 border-[#0D2A3E] dark:border-[#C9A843]/50 text-[#0D2A3E] dark:text-[#C9A843] hover:bg-[#0D2A3E]/5 dark:hover:bg-[#C9A843]/10'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Security Notice */}
                    <motion.div
                        className="flex items-center justify-center gap-2 mt-10 text-sm text-gray-500 dark:text-gray-400"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={4}
                    >
                        <Lock className="w-4 h-4" />
                        All plans include SSL encryption and data privacy compliance.
                    </motion.div>
                </div>
            </section>

            {/* Bottom Section */}
            <section className="py-24 px-4 bg-white dark:bg-[#0D2A3E]">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Why architectural precision matters in <span className="text-[#C9A843]">legal AI</span>?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-3xl mx-auto">
                            SamvidAI isn&apos;t just a contract reader; it&apos;s a digital counsel designed for the high-stakes environment of legal review. We utilize proprietary LLMs tuned for case law accuracy and structural integrity.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <motion.div
                            className="bg-[#F4F6F9] dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={1}
                        >
                            <Shield className="w-10 h-10 text-[#C9A843] mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Security</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ISO 27001 Certified environment with zero-knowledge encryption.</p>
                        </motion.div>
                        <motion.div
                            className="bg-[#F4F6F9] dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-8 text-center"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={2}
                        >
                            <BarChart3 className="w-10 h-10 text-[#C9A843] mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Accuracy</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">99.4% precision rate on standard commercial clauses.</p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}
