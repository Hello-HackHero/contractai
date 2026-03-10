import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, FileSearch, ArrowRight, Check, Star, Twitter, Github, Quote, Code2 } from 'lucide-react'

// Instagram SVG icon
function InstagramIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    )
}

const techStack = [
    { name: 'React + Vite', color: 'from-cyan-500 to-blue-500', icon: '⚛️' },
    { name: 'Supabase', color: 'from-emerald-500 to-green-500', icon: '🗄️' },
    { name: 'Groq AI - LLaMA 3.3 70B', color: 'from-orange-500 to-red-500', icon: '🤖' },
    { name: 'Tailwind CSS', color: 'from-sky-500 to-indigo-500', icon: '🎨' },
    { name: 'Vercel', color: 'from-gray-700 to-gray-900', icon: '▲' },
    { name: 'Stripe', color: 'from-purple-500 to-indigo-600', icon: '💳' },
]
import GlassCard from '../components/GlassCard'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
}

const features = [
    {
        icon: <FileSearch className="w-7 h-7" />,
        title: 'Smart Analysis',
        description: 'Upload any contract and get a thorough AI-powered analysis in seconds. Supports PDF and DOCX formats.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: <Shield className="w-7 h-7" />,
        title: 'Risk Detection',
        description: 'Identify risky clauses and hidden pitfalls that could cost you. Color-coded risk scoring makes it clear.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: <Zap className="w-7 h-7" />,
        title: 'Safer Alternatives',
        description: 'Get AI-suggested safer wording for every risky clause. Negotiate with confidence using plain language.',
        color: 'from-amber-500 to-orange-500',
    },
]

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: '/forever',
        description: 'Perfect for trying it out',
        features: ['2 analyses per month', 'Risk score overview', 'Summary preview', 'Email support'],
        cta: 'Get Started Free',
        featured: false,
    },
    {
        name: 'Pro',
        price: '₹299',
        period: '/month',
        description: 'For professionals who need more',
        features: ['Unlimited analyses', 'Full risk report', 'Safer alternatives', 'Download PDF reports', 'Priority support', 'All future features'],
        cta: 'Start Pro Plan',
        featured: true,
    },
]

export default function Landing() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 px-4">
                {/* Background gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-purple-950/20" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                            <Star className="w-4 h-4" />
                            AI-Powered Contract Intelligence
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                    >
                        Understand Any Contract{' '}
                        <span className="gradient-text">In Seconds</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                    >
                        Upload your legal contracts and let AI analyze risk, simplify complex language, and suggest safer alternatives — so you never sign blind again.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                    >
                        <Link to="/signup" className="gradient-btn text-lg px-8 py-4 flex items-center gap-2">
                            Start Analyzing <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/pricing" className="gradient-btn-outline text-lg px-8 py-4">
                            View Pricing
                        </Link>
                    </motion.div>

                    {/* Hero visual */}
                    <motion.div
                        className="mt-16 relative"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={4}
                    >
                        <div className="glass-card-strong p-8 max-w-3xl mx-auto">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-danger-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-success-500" />
                                <span className="ml-2 text-sm text-gray-400">contract_analysis.ai</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-danger-500/20 to-danger-500/5 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-danger-500">72</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white">Risk Score: High</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">3 risky clauses detected • 2 critical issues</p>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                                    <div className="h-full w-[72%] bg-gradient-to-r from-yellow-500 to-danger-500 rounded-full" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    {['Summary', 'Risky Clauses', 'Alternatives'].map(tab => (
                                        <div key={tab} className="py-2 px-3 rounded-lg bg-gray-50 dark:bg-white/5 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {tab}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4 bg-gray-50/50 dark:bg-dark-card/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything You Need to <span className="gradient-text">Stay Protected</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Our AI reads through complex legal language so you don't have to.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                            >
                                <GlassCard hover className="h-full">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Simple, <span className="gradient-text">Transparent Pricing</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Start free. Upgrade when you need more.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                            >
                                <GlassCard className={`h-full relative ${plan.featured ? 'border-primary-500/50 dark:border-primary-500/30 shadow-primary-500/10 shadow-2xl' : ''}`}>
                                    {plan.featured && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs font-bold rounded-full">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
                                    </div>
                                    <div className="flex items-baseline mb-8">
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                                        <span className="ml-1 text-gray-400">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map(f => (
                                            <li key={f} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <Check className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-primary-500' : 'text-success-500'}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to={plan.featured ? '/signup' : '/signup'}
                                        className={`block text-center w-full ${plan.featured ? 'gradient-btn' : 'gradient-btn-outline'}`}
                                    >
                                        {plan.cta}
                                    </Link>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technologies Used Section */}
            <section className="py-24 px-4 bg-gray-50/50 dark:bg-dark-card/50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
                            <Code2 className="w-4 h-4" />
                            Our Stack
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Technologies <span className="gradient-text">We Use</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Built with cutting-edge tools for reliability, speed, and intelligence.
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech, i) => (
                            <motion.div
                                key={tech.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i * 0.5}
                                className={`group relative inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r ${tech.color} text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default`}
                            >
                                <span className="text-lg">{tech.icon}</span>
                                {tech.name}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet the Developer Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        className="text-center mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Meet the <span className="gradient-text">Developer</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={1}
                    >
                        <GlassCard className="p-8 sm:p-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-bl-full" />
                            <div className="relative">
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    {/* Developer avatar placeholder */}
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                                        SM
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            Siddhartha Mishra
                                        </h3>
                                        <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
                                            BTech IT Student | AI & SaaS Developer
                                        </p>
                                        <div className="relative pl-5 border-l-2 border-primary-500/30 mb-6">
                                            <Quote className="w-5 h-5 text-primary-500/40 absolute -left-3 -top-1 bg-white dark:bg-dark-bg rounded" />
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                                "I built ContractAI to make legal contracts accessible and
                                                understandable for everyone. No more confusing legal jargon —
                                                just clear, AI-powered insights."
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <a
                                                href="https://www.instagram.com/sidd.hartha_/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                                            >
                                                <InstagramIcon className="w-4 h-4" />
                                                @sidd.hartha_
                                            </a>
                                            <a
                                                href="https://x.com/Tusharlenk82842"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                                            >
                                                <Twitter className="w-4 h-4" />
                                                X (Twitter)
                                            </a>
                                            <a
                                                href="https://github.com/Hello-HackHero/contractai"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                                            >
                                                <Github className="w-4 h-4" />
                                                GitHub
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <motion.div
                    className="max-w-4xl mx-auto text-center glass-card-strong p-12 sm:p-16 relative overflow-hidden"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={0}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-purple-600/5" />
                    <div className="relative">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to Read the <span className="gradient-text">Fine Print</span>?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                            Join thousands of professionals who trust ContractAI to protect their interests.
                        </p>
                        <Link to="/signup" className="gradient-btn text-lg px-8 py-4 inline-flex items-center gap-2">
                            Get Started Free <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
