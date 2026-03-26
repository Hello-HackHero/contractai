import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, FileSearch, ArrowRight, Check, Star, Upload, MessageSquare, Lock, FileText, BarChart3, Scale, Quote, ChevronRight } from 'lucide-react'

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
        icon: <Shield className="w-7 h-7" />,
        title: 'Risk Detection',
        description: 'Flags dangerous clauses and hidden liabilities instantly.',
    },
    {
        icon: <FileText className="w-7 h-7" />,
        title: 'Plain Language',
        description: 'Every legal term explained simply. No law degree needed.',
    },
    {
        icon: <MessageSquare className="w-7 h-7" />,
        title: 'Chat with Contract',
        description: 'Ask specific questions, get precise AI answers.',
    },
]

const steps = [
    {
        icon: <Upload className="w-8 h-8" />,
        title: 'Upload Contract',
        description: 'PDF or DOCX supported',
        step: '01',
    },
    {
        icon: <BarChart3 className="w-8 h-8" />,
        title: 'AI Analyses It',
        description: 'Risk scoring, clause flags, full breakdown',
        step: '02',
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: 'Take Action',
        description: 'Chat, download report, act fast',
        step: '03',
    },
]

const testimonials = [
    {
        quote: 'SamvidAI caught a liability clause our team missed. Saved us from a terrible deal.',
        name: 'Rohan M.',
        role: 'Business Owner',
    },
    {
        quote: 'The plain language breakdown is exactly what non-lawyers need. Game changer.',
        name: 'Priya S.',
        role: 'Startup Founder',
    },
    {
        quote: 'Risk score alone is worth it. I run every contract through SamvidAI now.',
        name: 'Aditya K.',
        role: 'Consultant',
    },
]

const archFeatures = [
    {
        icon: <Shield className="w-7 h-7" />,
        title: 'Risk Detection',
        description: 'Identifying non-standard clauses and potential liabilities with zero-latency scanning.',
    },
    {
        icon: <Scale className="w-7 h-7" />,
        title: 'Compliance Audit',
        description: 'Mapping your contracts against the latest jurisdictional regulations and case law.',
    },
    {
        icon: <FileSearch className="w-7 h-7" />,
        title: 'AI Summarization',
        description: 'Generating executive summaries that highlight critical dates, obligations, and penalties.',
    },
]

export default function Landing() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleContact = async (e) => {
        e.preventDefault()
        window.location.href = 
          `mailto:sidd37ms@gmail.com?subject=SamvidAI Enquiry from ${name}&body=${message}%0A%0AFrom: ${email}`
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0D2A3E] via-[#112E44] to-[#163D59]" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#C9A843]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#C9A843]/5 rounded-full blur-3xl" />

                <div className="relative max-w-5xl mx-auto text-center">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A843]/15 text-[#C9A843] text-sm font-medium mb-6">
                            <Star className="w-4 h-4" />
                            AI-Powered Contract Intelligence
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-white"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                    >
                        Analyse Contracts{' '}
                        <span className="text-[#C9A843]">with AI Precision</span>
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                    >
                        Transform complex legal documentation into actionable insights. Our architectural AI counsel identifies risks, anomalies, and opportunities in seconds.
                    </motion.p>

                    {/* Upload Drop Zone */}
                    <motion.div
                        className="max-w-xl mx-auto mb-10"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                    >
                        <Link
                            to="/upload"
                            className="block border-2 border-dashed border-[#C9A843]/40 hover:border-[#C9A843]/70 rounded-2xl p-8 transition-all duration-300 hover:bg-[#C9A843]/5 group"
                        >
                            <Upload className="w-10 h-10 text-[#C9A843] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                            <p className="text-lg font-semibold text-white mb-1">Drop your Contract here</p>
                            <p className="text-sm text-gray-400">PDF, DOCX, or TXT up to 50MB</p>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={4}
                    >
                        <div className="text-center">
                            <p className="text-3xl font-bold text-[#C9A843]">94.7%</p>
                            <p className="text-sm text-gray-400">Accuracy benchmark against senior counsel</p>
                        </div>
                        <div className="hidden sm:block w-px h-12 bg-white/20" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-[#C9A843]">&lt;2 min</p>
                            <p className="text-sm text-gray-400">Average analysis time per 50-page document</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why SamvidAI Section */}
            <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-[#091F2E] transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Why <span className="text-[#C9A843]">SamvidAI</span>?
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                                className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-xl dark:hover:shadow-none hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-[#0D2A3E] flex items-center justify-center text-[#C9A843] mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-4 bg-white dark:bg-[#0D2A3E] transition-colors duration-200">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            How It <span className="text-[#C9A843]">Works</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                                className="text-center relative"
                            >
                                <div className="text-5xl font-extrabold text-[#C9A843]/15 mb-2">{step.step}</div>
                                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#0D2A3E] flex items-center justify-center text-[#C9A843] mx-auto mb-4 shadow-lg">
                                    {step.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{step.description}</p>
                                {i < 2 && (
                                    <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-[#C9A843]/40 -translate-y-1/2" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 px-4 bg-gray-50 dark:bg-[#091F2E] transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Trusted by <span className="text-[#C9A843]">Professionals</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={t.name}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                                className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-8"
                            >
                                <Quote className="w-8 h-8 text-[#C9A843]/30 mb-4" />
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 italic">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architectural Features Section */}
            <section className="py-24 px-4 bg-white dark:bg-[#0D2A3E] transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Architectural <span className="text-[#C9A843]">Features</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {archFeatures.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i + 1}
                                className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:shadow-lg dark:hover:shadow-none hover:shadow-gray-200/50 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#0D2A3E] flex items-center justify-center text-[#C9A843] mb-5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Featured Quote */}
                    <motion.div
                        className="bg-[#0D2A3E] dark:bg-[#0B2236] rounded-2xl p-10 text-center border border-white/10"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={4}
                    >
                        <Quote className="w-10 h-10 text-[#C9A843]/40 mx-auto mb-4" />
                        <p className="text-lg text-gray-200 italic max-w-3xl mx-auto mb-6">
                            &ldquo;SamvidAI has redefined our due diligence process. What used to take days now takes minutes, with a higher degree of precision.&rdquo;
                        </p>
                        <p className="font-semibold text-white">Marcus Thorne</p>
                        <p className="text-sm text-[#C9A843]">Managing Partner, Thorne & Co.</p>
                    </motion.div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-24 px-4 bg-gray-50 dark:bg-[#091F2E] transition-colors duration-200">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={0}
                    >
                        <Lock className="w-12 h-12 text-[#C9A843] mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                            Secure. Private. <span className="text-[#C9A843]">Sovereignty</span> over your data.
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-12">
                            We deploy localized LLMs that ensure your legal documents never leave your private environment. Encryption is not an option; it&apos;s our foundation.
                        </p>
                    </motion.div>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        custom={1}
                    >
                        <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl px-10 py-8 text-center">
                            <p className="text-3xl font-bold text-[#C9A843] mb-1">AES-256</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Encryption</p>
                        </div>
                        <div className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl px-10 py-8 text-center">
                            <p className="text-3xl font-bold text-[#C9A843] mb-1">SOC2</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Compliant</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-[#0D2A3E]">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={0}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                        Ready to Analyse Your <span className="text-[#C9A843]">Contract</span>?
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        3 free contracts/month. No signup required.
                    </p>
                    <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 bg-[#C9A843] hover:bg-[#D9B94E] text-[#0D2A3E] font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#C9A843]/25"
                    >
                        Start Analyzing <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-gray-50 dark:bg-[#091F2E] transition-colors duration-200">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Get in Touch
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Questions? We'd love to hear from you.
                    </p>
                    
                    <form onSubmit={handleContact} 
                        className="bg-white dark:bg-[#0B2236] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-left space-y-4 shadow-sm">
                        
                        <input type="text" placeholder="Your Name"
                            required
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0D2A3E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-[#C9A843] transition-all"/>
                        
                        <input type="email" placeholder="Your Email"
                            required
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0D2A3E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-[#C9A843] transition-all"/>
                        
                        <textarea placeholder="Your Message" rows={4}
                            required
                            value={message} onChange={e => setMessage(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0D2A3E] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-[#C9A843] transition-all resize-none"/>
                        
                        <button type="submit"
                            className="w-full py-3 bg-[#C9A843] text-[#0D2A3E] font-bold rounded-lg hover:bg-[#b8933a] transition-all duration-200 shadow-lg shadow-[#C9A843]/10">
                            Send Message →
                        </button>
                        
                        {submitted && (
                            <p className="text-green-500 text-center text-sm font-medium animate-fade-in">
                                ✓ Message sent! We'll reply to sidd37ms@gmail.com
                            </p>
                        )}
                    </form>
                </div>
            </section>
        </div>
    )
}
