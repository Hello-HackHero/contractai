import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
}

const sections = [
    {
        title: '1. Acceptance of Terms',
        content: [
            'By accessing or using the SamvidAI platform, you acknowledge that you have read, understood, and agree to be bound by these legal protocols. These terms constitute a legally binding agreement between you and the SamvidAI architectural counsel entity.',
            'Failure to comply with these parameters may result in immediate suspension of cryptographic access keys and formal legal citation within our jurisdictional registry.',
        ],
    },
    {
        title: '2. Use of Service',
        content: [
            'The SamvidAI interface is designed for professional legal architectural analysis. Users are granted a limited, non-exclusive license to deploy our neural processing units for contract examination and repository management.',
            'Reverse engineering of the proprietary SamvidAI logic engines or unauthorized extraction of citation metadata is strictly prohibited under the Architectural Protection Act of 2024.',
        ],
    },
    {
        title: '3. Data Privacy & Security',
        content: [
            'Client confidentiality is the cornerstone of our digital vault. All uploaded documentation is processed through end-to-end encrypted tunnels and stored within zero-knowledge architectural clusters.',
            'We do not train our primary neural weights on private client data. Your legal intelligence remains isolated, immutable, and fully under your jurisdictional control at all times.',
        ],
    },
    {
        title: '4. Limitation of Liability',
        content: [
            'SamvidAI provides analytical guidance through sophisticated neural modeling. However, our output does not constitute final binding legal counsel. Users must verify all automated citations with qualified human architects.',
            'In no event shall SamvidAI be liable for any indirect, incidental, or consequential damages arising from the structural deployment of our insights within high-stakes judicial environments.',
        ],
    },
]

export default function TermsOfService() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative pt-32 pb-16 px-4 bg-[#0D2A3E] dark:bg-[#071621]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                    >
                        Terms of <span className="text-[#C9A843]">Service</span>
                    </motion.h1>
                    <motion.p
                        className="text-gray-300"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                    >
                        Last updated: March 2026
                    </motion.p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16 px-4 bg-white dark:bg-[#0D2A3E]">
                <div className="max-w-3xl mx-auto space-y-12">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-[#C9A843] pl-4">
                                {section.title}
                            </h2>
                            <div className="space-y-4">
                                {section.content.map((paragraph, j) => (
                                    <p key={j} className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}
