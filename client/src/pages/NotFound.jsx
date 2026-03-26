import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
}

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D2A3E] via-[#112E44] to-[#163D59] px-4">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#C9A843]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-[#C9A843]/5 rounded-full blur-3xl" />

            <div className="relative text-center max-w-lg mx-auto">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                    <h1 className="text-[10rem] sm:text-[12rem] font-extrabold text-[#C9A843]/20 leading-none select-none">
                        404
                    </h1>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 -mt-8">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved. Our architectural intelligence suggests a strategic redirection.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={2}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#C9A843] hover:bg-[#D9B94E] text-[#0D2A3E] font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 border-2 border-[#C9A843]/50 text-[#C9A843] font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-[#C9A843]/10 hover:border-[#C9A843]"
                    >
                        <FileText className="w-5 h-5" />
                        Analyse a Contract
                    </Link>
                </motion.div>

                <motion.p
                    className="text-gray-500 text-sm mt-10"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={3}
                >
                    Need help? Contact us at{' '}
                    <a href="mailto:support@samvid.ai" className="text-[#C9A843] hover:underline">
                        support@samvid.ai
                    </a>
                </motion.p>
            </div>
        </div>
    )
}
