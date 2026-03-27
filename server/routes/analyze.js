import { Router } from 'express'
import Groq from 'groq-sdk'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { InferenceClient } from '@huggingface/inference'
import { verifyAuth } from '../middleware/auth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
})

const hfClient = new InferenceClient(process.env.HF_TOKEN)
const HF_MODEL = "siddhartha37ms/contract-analyzer-legal"

async function extractText(file) {
    const ext = file.originalname.toLowerCase().split('.').pop()
    if (ext === 'pdf') {
        const data = await pdfParse(file.buffer)
        return data.text
    }
    if (ext === 'docx') {
        const result = await mammoth.extractRawText({ buffer: file.buffer })
        return result.value
    }
    throw new Error('Unsupported file type. Please upload PDF or DOCX.')
}

async function analyzeWithHF(contractText) {
  try {
    const response = await hfClient.chatCompletion({
      model: HF_MODEL,
      messages: [{
        role: "user",
        content: `Analyze this contract and respond ONLY in JSON:
{
  "riskScore": <0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "keyClauses": ["clause1", "clause2"],
  "redFlags": ["flag1", "flag2"],
  "summary": "2-3 sentence plain English summary"
}

CONTRACT:
${contractText.slice(0, 3000)}`
      }],
      max_tokens: 1024,
      temperature: 0.3
    })
    
    const raw = response.choices[0].message.content
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error("HF Error:", err.message)
    return null
  }
}

async function analyzeWithGroq(contractText) {
  try {
    const chat = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Analyze this contract and respond ONLY in JSON:
{
  "riskScore": <0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "keyClauses": ["clause1", "clause2"],
  "redFlags": ["flag1", "flag2"],
  "summary": "2-3 sentence plain English summary"
}

CONTRACT:
${contractText.slice(0, 3000)}`
      }],
      temperature: 0.3,
      max_tokens: 1024
    })
    
    const raw = chat.choices[0].message.content
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error("Groq Error:", err.message)
    return null
  }
}

// Main analyze endpoint
router.post('/analyze', verifyAuth, upload.single('contract'), async (req, res) => {
  try {
    const userId = req.user.id
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    
    // Extract text from file
    const contractText = await extractText(req.file)
    
    if (!contractText || contractText.length < 50) {
      return res.status(400).json({ 
        error: 'Could not extract text from file' 
      })
    }

    // Usage check
    const { data: profile } = await req.supabase
        .from('profiles')
        .select('subscription, analyses_used')
        .eq('id', userId)
        .single()
    
    const limit = profile?.subscription === 'pro' ? 25 : 3
    if ((profile?.analyses_used || 0) >= limit) {
        return res.status(403).json({ error: 'Monthly limit reached' })
    }
    
    // Try HF first, fallback to Groq
    console.log("Analyzing with HuggingFace...")
    let result = await analyzeWithHF(contractText)
    let modelUsed = "HuggingFace"
    
    if (!result) {
      console.log("HF failed, trying Groq...")
      result = await analyzeWithGroq(contractText)
      modelUsed = "Groq"
    }
    
    if (!result) {
      return res.status(500).json({ 
        error: 'Analysis failed. Please try again.' 
      })
    }
    
    console.log(`✅ Analysis done via ${modelUsed}`)

    // Mapping for database consistency
    const analysisData = {
        overall_risk_score: result.riskScore || 50,
        risk_level: result.riskLevel || "MEDIUM",
        summary: result.summary || "Analysis complete.",
        clauses: {
            high_risk: result.redFlags.map(f => ({ title: "Risk", text: f, explanation: f })),
            medium_risk: [],
            low_risk: result.keyClauses.map(c => ({ title: "Clause", text: c, explanation: "Key provision" }))
        },
        red_flags: result.redFlags || [],
        recommendations: result.redFlags.map(f => `Address: ${f}`),
        modelUsed
    }

    // Save to database
    const { data: contract, error: dbError } = await req.supabase
        .from('contracts')
        .insert({
            user_id: userId,
            file_name: req.file.originalname,
            risk_score: result.riskScore || 50,
            analysis_result: analysisData,
        })
        .select()
        .single()

    if (dbError) throw dbError

    // Increment usage
    await req.supabase
        .from('profiles')
        .update({ analyses_used: (profile?.analyses_used || 0) + 1 })
        .eq('id', userId)
    
    console.log(`✅ Model used: ${modelUsed}`)
    console.log(`✅ Risk Score: ${result.riskScore}`)

    return res.json({
      success: true,
      contractId: contract.id, // Critical for frontend navigation
      riskScore: result.riskScore || 50,
      riskLevel: result.riskLevel || "MEDIUM",
      keyClauses: result.keyClauses || [],
      redFlags: result.redFlags || [],
      summary: result.summary || "Analysis complete.",
      modelUsed
    })
    
  } catch (error) {
    console.error("Analyze route error:", error)
    return res.status(500).json({ 
      error: error.message || 'Server error' 
    })
  }
})

export default router
