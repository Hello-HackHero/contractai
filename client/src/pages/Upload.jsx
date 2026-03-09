import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Upload as UploadIcon, FileText, X, AlertCircle } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Spinner from '../components/Spinner'
import mammoth from 'mammoth'

// Extract text from file BEFORE uploading
async function extractTextFromFile(file) {
    const ext = file.name.toLowerCase().split('.').pop()

    if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return result.value
    }

    if (ext === 'pdf') {
        // Read PDF as ArrayBuffer and send to server for extraction
        // We send the raw base64 to avoid downloading from storage
        return null // PDF extraction handled server-side via uploaded buffer
    }

    throw new Error('Unsupported file type. Please upload PDF or DOCX.')
}

export default function Upload() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [error, setError] = useState('')

    const isPro = profile?.subscription === 'pro'
    const analysesUsed = profile?.analyses_used || 0
    const limitReached = !isPro && analysesUsed >= 2

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        setError('')
        if (rejectedFiles.length > 0) {
            setError('Only PDF and DOCX files are accepted (max 10MB)')
            return
        }
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 1,
        disabled: limitReached,
    })

    const handleUpload = async () => {
        if (!file || !user) return
        setError('')
        setUploading(true)

        try {
            // Step 1: Extract text from file locally BEFORE uploading
            let extractedText = null
            const ext = file.name.toLowerCase().split('.').pop()

            if (ext === 'docx') {
                const arrayBuffer = await file.arrayBuffer()
                const result = await mammoth.extractRawText({ arrayBuffer })
                extractedText = result.value
            } else if (ext === 'pdf') {
                // For PDF, read as base64 and let the server parse it
                const arrayBuffer = await file.arrayBuffer()
                const bytes = new Uint8Array(arrayBuffer)
                const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
                extractedText = btoa(binary) // base64 — server will decode & parse
            }

            // Step 2: Upload file to Supabase Storage
            const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('contracts')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('contracts')
                .getPublicUrl(fileName)

            setUploading(false)
            setAnalyzing(true)

            // Step 3: Send extracted text + metadata to backend for AI analysis
            const session = await supabase.auth.getSession()
            const token = session.data.session?.access_token

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    extractedText,          // text extracted locally (or base64 for PDF)
                    fileName: file.name,
                    filePath: fileName,
                    fileUrl: urlData.publicUrl,
                    isPdfBase64: ext === 'pdf', // flag so server knows to decode
                }),
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Analysis failed')
            }

            // Step 4 & 5: backend saves to DB, we navigate to results
            const result = await response.json()
            navigate(`/results/${result.contractId}`)
        } catch (err) {
            setError(err.message)
            setUploading(false)
            setAnalyzing(false)
        }
    }

    const removeFile = () => {
        setFile(null)
        setError('')
    }

    if (analyzing) {
        return (
            <div className="page-container flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-purple-950/20 -z-10" />
                <GlassCard className="max-w-md w-full text-center p-10">
                    <Spinner text="Analyzing contract..." />
                    <p className="mt-4 text-sm text-gray-400">Our AI is reading through your contract and identifying risks. This usually takes 15-30 seconds.</p>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="page-container">
            <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-bg dark:to-purple-950/20 -z-10" />

            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Upload Contract</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Upload a PDF or DOCX file to get instant AI analysis
                    </p>
                </div>

                {limitReached && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Free plan limit reached</p>
                            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                                You've used your 2 free analyses this month. <a href="/pricing" className="underline font-semibold">Upgrade to Pro</a> for unlimited access.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm">
                        {error}
                    </div>
                )}

                <GlassCard className="mb-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                            ? 'border-primary-500 bg-primary-500/5'
                            : limitReached
                                ? 'border-gray-200 dark:border-dark-border opacity-50 cursor-not-allowed'
                                : 'border-gray-300 dark:border-dark-border hover:border-primary-500/50 hover:bg-primary-500/5'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                            <UploadIcon className={`w-8 h-8 ${isDragActive ? 'text-primary-500' : 'text-gray-400'}`} />
                        </div>
                        {isDragActive ? (
                            <p className="text-primary-600 dark:text-primary-400 font-medium">Drop your file here...</p>
                        ) : (
                            <>
                                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    Drag & drop your contract here
                                </p>
                                <p className="text-sm text-gray-400">
                                    or <span className="text-primary-600 dark:text-primary-400 font-medium">browse files</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-3">Supports PDF, DOCX • Max 10MB</p>
                            </>
                        )}
                    </div>
                </GlassCard>

                {file && (
                    <GlassCard className="mb-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-danger-500 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </GlassCard>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading || limitReached}
                    className="gradient-btn w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>Analyze Contract</>
                    )}
                </button>
            </div>
        </div>
    )
}
