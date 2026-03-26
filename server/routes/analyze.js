import { Router } from 'express'
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { verifyAuth } from '../middleware/auth.js'
import { analyzeWithHF } from '../services/hfService.js'

const router = Router()

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
})

async function callGroq(messages) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: messages,
    max_tokens: 2000,
    temperature: 0.1,
    response_format: { type: "json_object" }
  })
  return completion.choices[0]?.message?.content
}

// ─── PART 1: Chunking for long contracts ────────────────────────────────────

function chunkText(text, chunkSize = 3000, overlap = 200) {
    const words = text.split(' ')
    const chunks = []
    let i = 0
    while (i < words.length) {
        const chunk = words.slice(i, i + chunkSize).join(' ')
        chunks.push(chunk)
        i += chunkSize - overlap
    }
    return chunks
}

// ─── PART 2: Groq prompt for each chunk ─────────────────────────────────────

const systemPrompt = `You are a senior legal contract analyst. 
Analyse the given contract text and return ONLY a valid JSON object.
No explanation, no markdown, no extra text. Only JSON.

Return this exact structure:
{
  "clauses": [
    {
      "title": "clause name",
      "type": "high_risk" | "medium_risk" | "low_risk",
      "severity": 1-10,
      "text": "relevant excerpt (max 100 words)",
      "explanation": "why this is risky in plain language",
      "recommendation": "what to do about it"
    }
  ],
  "red_flags": ["flag1", "flag2"],
  "summary": "2-3 sentence contract summary",
  "contract_type": "Employment/NDA/Service/Lease/Other"
}`

// (analyseChunk removed for callGroq)

// ─── PART 3: Merge chunk results ────────────────────────────────────────────

function mergeChunkResults(chunkResults) {
    const allClauses = []
    const allRedFlags = []
    let summary = ''
    let contractType = 'Other'

    chunkResults.forEach((result) => {
        if (result.clauses) allClauses.push(...result.clauses)
        if (result.red_flags) allRedFlags.push(...result.red_flags)
        if (result.summary) summary = result.summary
        if (result.contract_type) contractType = result.contract_type
    })

    // Remove duplicate red flags
    const uniqueRedFlags = [...new Set(allRedFlags)]

    return { allClauses, uniqueRedFlags, summary, contractType }
}

// ─── PART 4: Risk score calculation (0–100) ─────────────────────────────────

function calculateRiskScore(clauses) {
    if (!clauses || clauses.length === 0) return 0

    const weights = { high_risk: 3, medium_risk: 1.5, low_risk: 0.5 }

    let totalWeight = 0
    let weightedSeverity = 0

    clauses.forEach((clause) => {
        const weight = weights[clause.type] || 1
        totalWeight += weight
        weightedSeverity += (clause.severity || 5) * weight
    })

    const rawScore = totalWeight > 0 ? weightedSeverity / totalWeight : 0
    const normalizedScore = Math.min(100, Math.round((rawScore / 10) * 100))
    return normalizedScore
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function decodeBase64ToBuffer(base64) {
    return Buffer.from(base64, 'base64')
}

async function extractText(buffer, fileName) {
    const ext = fileName.toLowerCase().split('.').pop()

    if (ext === 'pdf') {
        const data = await pdfParse(buffer)
        return data.text
    }

    if (ext === 'docx') {
        const result = await mammoth.extractRawText({ buffer })
        return result.value
    }

    throw new Error('Unsupported file type. Please upload PDF or DOCX.')
}

// ─── PART 5 & 6: Main route with response structure & error handling ────────

router.post('/analyze', verifyAuth, async (req, res) => {
    try {
        const { extractedText, isPdfBase64, fileUrl, fileName, filePath } = req.body
        const userId = req.user.id

        // ── Usage limit checks ──────────────────────────────────────────

        const { data: profile } = await req.supabase
            .from('profiles')
            .select('subscription, analyses_used, analyses_reset_at')
            .eq('id', userId)
            .single()

        if (!profile) {
            await req.supabase.from('profiles').insert({
                id: userId,
                email: req.user.email,
                plan: 'free',
                analyses_used: 0,
            })
        }

        const plan = profile?.subscription || 'free'
        const analysesUsed = profile?.analyses_used || 0

        const resetAt = profile?.analyses_reset_at
            ? new Date(profile.analyses_reset_at)
            : new Date()
        const now = new Date()
        const monthDiff =
            (now.getFullYear() - resetAt.getFullYear()) * 12 +
            (now.getMonth() - resetAt.getMonth())

        let currentUsage = analysesUsed
        if (monthDiff >= 1) {
            currentUsage = 0
            await req.supabase
                .from('profiles')
                .update({ analyses_used: 0, analyses_reset_at: now.toISOString() })
                .eq('id', userId)
        }

        const limit = plan === 'pro' ? 25 : 3
        if (currentUsage >= limit) {
            return res.status(403).json({
                error: `${plan === 'pro' ? 'Pro' : 'Free'} plan limit reached. ${plan === 'pro' ? 'Contact support for more.' : 'Upgrade to Pro for more analyses.'}`,
            })
        }

        // ── Extract text from file ──────────────────────────────────────

        let text
        if (isPdfBase64 && extractedText) {
            const buffer = decodeBase64ToBuffer(extractedText)
            text = await extractText(buffer, fileName)
        } else if (extractedText) {
            text = extractedText
        } else {
            return res.status(400).json({ error: 'No file content received for analysis.' })
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({
                error: 'Could not extract enough text from the file. Please upload a different file.',
            })
        }

        // ── Chunking & analysis ─────────────────────────────────────────

        // ── PART 6: Dual-Model Analysis (HF Primary, Groq Fallback) ─────
        let analysisData = null
        let modelUsed = "HuggingFace"

        console.log("Trying HuggingFace model...")
        const hfResult = await analyzeWithHF(text)

        if (hfResult) {
            console.log("HuggingFace analysis successful ✅")
            analysisData = {
                overall_risk_score: hfResult.riskScore,
                risk_level: hfResult.riskLevel,
                contract_type: "Contract", // HF doesn't always return this, defaulting
                summary: hfResult.summary,
                clauses: {
                    high_risk: hfResult.redFlags.map(flag => ({ title: "Risk", text: flag, type: "high_risk", severity: 8, explanation: flag, recommendation: "Review carefully" })),
                    medium_risk: [],
                    low_risk: hfResult.keyClauses.map(clause => ({ title: "Clause", text: clause, type: "low_risk", severity: 2, explanation: "Key provision identified", recommendation: "Standard clause" })),
                },
                red_flags: hfResult.redFlags,
                recommendations: hfResult.redFlags.map(f => `Mitigate: ${f}`),
                total_clauses_analysed: hfResult.keyClauses.length + hfResult.redFlags.length,
                model_used: "HuggingFace"
            }
        } else {
            console.log("HF failed or returned null, falling back to Groq...")
            modelUsed = "Groq"
            
            // Existing Groq logic (Chunking if needed)
            const wordCount = text.split(' ').length
            let chunkResults = []

            if (wordCount <= 3000) {
                const messages = [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyse this contract text:\n\n${text}` }
                ]
                const result = await callGroq(messages)
                if (result) chunkResults.push(JSON.parse(result))
            } else {
                const chunks = chunkText(text)
                for (let i = 0; i < chunks.length; i++) {
                    try {
                        const result = await callGroq([{ role: 'system', content: systemPrompt }, { role: 'user', content: `Analyse this contract section:\n\n${chunks[i]}` }])
                        if (result) chunkResults.push(JSON.parse(result))
                    } catch (err) { continue }
                }
            }

            if (chunkResults.length === 0) {
                return res.status(500).json({ error: 'AI analysis failed for both HF and Groq. Please try again.' })
            }

            const { allClauses, uniqueRedFlags, summary, contractType } = mergeChunkResults(chunkResults)
            const score = calculateRiskScore(allClauses)

            analysisData = {
                overall_risk_score: score,
                risk_level: score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW',
                contract_type: contractType,
                summary: summary,
                clauses: {
                    high_risk: allClauses.filter((c) => c.type === 'high_risk'),
                    medium_risk: allClauses.filter((c) => c.type === 'medium_risk'),
                    low_risk: allClauses.filter((c) => c.type === 'low_risk'),
                },
                red_flags: uniqueRedFlags,
                recommendations: allClauses.filter((c) => c.type === 'high_risk').map((c) => c.recommendation).filter(Boolean).slice(0, 5),
                total_clauses_analysed: allClauses.length,
                model_used: "Groq"
            }
        }

        // ── PART 7: Build response ──────────────────────────────────────

        // ── Save to database ────────────────────────────────────────────

        const { data: contract, error: dbError } = await req.supabase
            .from('contracts')
            .insert({
                user_id: userId,
                file_name: fileName,
                file_url: fileUrl,
                risk_score: analysisData.overall_risk_score,
                analysis_result: analysisData,
            })
            .select()
            .single()

        if (dbError) throw dbError

        // Increment usage
        await req.supabase
            .from('profiles')
            .update({ analyses_used: currentUsage + 1 })
            .eq('id', userId)

        res.json({
            success: true,
            contractId: contract.id,
            data: analysisData,
        })
    } catch (err) {
        console.error('Analysis error:', err)
        res.status(500).json({ error: err.message || 'Analysis failed' })
    }
})

export default router
