import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars')
    return createClient(url, key)
}

// Verify JWT and return user
async function verifyAuth(req) {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw { status: 401, message: 'Missing authorization header' }
    }
    const token = authHeader.split(' ')[1]
    const supabase = getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) throw { status: 401, message: 'Invalid token' }
    return { user, supabase }
}

// Decode base64 PDF to buffer
function decodeBase64ToBuffer(base64) {
    return Buffer.from(base64, 'base64')
}

// AI analysis with Groq
async function analyzeWithAI(text) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const truncatedText = text.substring(0, 12000)

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

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 6000,
        response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content || '{}'
    return JSON.parse(responseText)
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Auth
        const { user, supabase } = await verifyAuth(req)
        const userId = user.id

        const { extractedText, isPdfBase64, fileUrl, fileName, filePath } = req.body

        // Check usage limits
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription, analyses_used, analyses_reset_at')
            .eq('id', userId)
            .single()

        if (!profile) {
            await supabase.from('profiles').insert({
                id: userId,
                email: user.email,
                subscription: 'free',
                analyses_used: 0,
            })
        }

        const plan = profile?.subscription || 'free'
        const analysesUsed = profile?.analyses_used || 0

        // Monthly reset check
        const resetAt = profile?.analyses_reset_at ? new Date(profile.analyses_reset_at) : new Date()
        const now = new Date()
        const monthDiff = (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth())

        let currentUsage = analysesUsed
        if (monthDiff >= 1) {
            currentUsage = 0
            await supabase
                .from('profiles')
                .update({ analyses_used: 0, analyses_reset_at: now.toISOString() })
                .eq('id', userId)
        }

        if (plan === 'free' && currentUsage >= 2) {
            return res.status(403).json({ error: 'Free plan limit reached. Upgrade to Pro for unlimited analyses.' })
        }

        // Extract text
        let text
        if (isPdfBase64 && extractedText) {
            const pdfParse = (await import('pdf-parse')).default
            const buffer = decodeBase64ToBuffer(extractedText)
            const data = await pdfParse(buffer)
            text = data.text
        } else if (extractedText) {
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
        const { data: contract, error: dbError } = await supabase
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
        await supabase
            .from('profiles')
            .update({ analyses_used: currentUsage + 1 })
            .eq('id', userId)

        return res.status(200).json({ contractId: contract.id, analysis })
    } catch (err) {
        console.error('Analysis error:', err)
        const status = err.status || 500
        return res.status(status).json({ error: err.message || 'Analysis failed' })
    }
}
