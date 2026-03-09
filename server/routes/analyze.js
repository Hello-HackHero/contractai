import { Router } from 'express'
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { verifyAuth } from '../middleware/auth.js'

const router = Router()

let groq = null
function getGroq() {
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    }
    return groq
}

// Decode base64-encoded PDF sent from client
function decodeBase64ToBuffer(base64) {
    return Buffer.from(base64, 'base64')
}

// Extract text from PDF or DOCX
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

// Analyze text with Groq AI
async function analyzeWithAI(text) {
    const truncatedText = text.substring(0, 12000) // Limit context window

    const prompt = `You are a legal contract analyst AI. Analyze the following contract text and return a JSON response with exactly this structure:

{
  "risk_score": <number 0-100, where 0 is safest and 100 is riskiest>,
  "summary": "<a clear, plain-language summary of the contract in 3-5 sentences>",
  "simplified_summary": "<an even simpler 1-2 sentence summary for non-lawyers>",
  "overall_assessment": "<brief overall risk assessment and key takeaways in 2-3 sentences>",
  "key_parties": ["<name/role of party 1>", "<name/role of party 2>"],
  "key_dates": ["<important date or deadline mentioned>"],
  "payment_terms": "<description of payment terms if any, or null>",
  "obligations": ["<key obligation 1>", "<key obligation 2>"],
  "termination_conditions": ["<condition under which contract can be terminated>"],
  "risky_clauses": [
    {
      "title": "<short title for the risky clause>",
      "description": "<explanation of why this is risky in plain language>",
      "severity": "<high|medium|low>",
      "text": "<the actual clause text from the contract>",
      "safer_alternative": "<a safer, fairer rewrite of this clause>"
    }
  ],
  "alternatives": [
    {
      "title": "<what clause this alternative is for>",
      "original": "<the original risky clause text>",
      "suggested": "<a safer alternative wording>"
    }
  ],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "clause_breakdown": [
    {
      "section": "<section or clause name>",
      "analysis": "<plain-language explanation of what this section means and any concerns>"
    }
  ]
}

Important rules:
- risk_score must be a single integer from 0-100
- Identify ALL risky clauses, not just major ones
- For EVERY risky clause provide a safer_alternative rewrite
- Write summaries in simple English anyone can understand
- clause_breakdown should cover the 5-8 most important sections
- Return ONLY valid JSON, no markdown or extra text

Contract text:
${truncatedText}`

    const completion = await getGroq().chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    return JSON.parse(responseText)
}

router.post('/analyze', verifyAuth, async (req, res) => {
    try {
        const { extractedText, isPdfBase64, fileUrl, fileName, filePath } = req.body
        const userId = req.user.id

        // Check usage limits
        const { data: profile } = await req.supabase
            .from('profiles')
            .select('subscription, analyses_used, analyses_reset_at')
            .eq('id', userId)
            .single()

        if (!profile) {
            // Create profile if it doesn't exist
            await req.supabase.from('profiles').insert({
                id: userId,
                email: req.user.email,
                plan: 'free',
                analyses_used: 0,
            })
        }

        const plan = profile?.subscription || 'free'
        const analysesUsed = profile?.analyses_used || 0

        // Check if monthly reset is needed
        const resetAt = profile?.analyses_reset_at ? new Date(profile.analyses_reset_at) : new Date()
        const now = new Date()
        const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth())

        let currentUsage = analysesUsed
        if (monthDiff >= 1) {
            // Reset monthly counter
            currentUsage = 0
            await req.supabase
                .from('profiles')
                .update({ analyses_used: 0, analyses_reset_at: now.toISOString() })
                .eq('id', userId)
        }

        if (plan === 'free' && currentUsage >= 2) {
            return res.status(403).json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited analyses.' })
        }

        // Use text extracted client-side (avoids downloading from Supabase storage)
        let text
        if (isPdfBase64 && extractedText) {
            // PDF was sent as base64 — decode and parse server-side
            const buffer = decodeBase64ToBuffer(extractedText)
            text = await extractText(buffer, fileName)
        } else if (extractedText) {
            // DOCX text already extracted on client via mammoth
            text = extractedText
        } else {
            return res.status(400).json({ error: 'No file content received for analysis.' })
        }

        if (!text || text.trim().length < 50) {
            return res.status(400).json({ error: 'Could not extract enough text from the file. Please upload a different file.' })
        }

        // AI Analysis
        const analysis = await analyzeWithAI(text)

        // Save to database
        const { data: contract, error: dbError } = await req.supabase
            .from('contracts')
            .insert({
                user_id: userId,
                file_name: fileName,
                file_url: fileUrl,
                risk_score: analysis.risk_score || 0,
                analysis_result: analysis,
            })
            .select()
            .single()

        if (dbError) throw dbError

        // Increment usage
        await req.supabase
            .from('profiles')
            .update({ analyses_used: currentUsage + 1 })
            .eq('id', userId)

        res.json({ contractId: contract.id, analysis })
    } catch (err) {
        console.error('Analysis error:', err)
        res.status(500).json({ error: err.message || 'Analysis failed' })
    }
})

export default router
