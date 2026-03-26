import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Wand2 } from 'lucide-react'
import GlassCard from '../components/GlassCard'

export default function Login() {
    const { signIn, signInWithOtp } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const [mode, setMode] = useState('password') // 'password' or 'magic'

    const handlePasswordLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signIn(email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLink = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signInWithOtp(email)
            setMagicLinkSent(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-container flex items-center justify-center min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 bg-[#F4F6F9] dark:bg-[#0D2A3E] -z-10" />

            <div className="w-full max-w-md animate-fade-in">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-500 dark:text-gray-400">Sign in to continue to SamvidAI</p>
                    </div>

                    {magicLinkSent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check your email!</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mode Toggle */}
                            <div className="flex bg-gray-100 dark:bg-dark-card rounded-xl p-1 mb-6">
                                <button
                                    onClick={() => setMode('password')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'password' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                >
                                    Password
                                </button>
                                <button
                                    onClick={() => setMode('magic')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'magic' ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                                >
                                    Magic Link
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="input-field pl-11"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {mode === 'password' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="input-field pl-11"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : mode === 'password' ? (
                                            <>Sign In <ArrowRight className="w-4 h-4" /></>
                                        ) : (
                                            <>Send Magic Link <Wand2 className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#C9A843] font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
