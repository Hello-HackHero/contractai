import { Router } from 'express'
import Groq from 'groq-sdk'
import { verifyAuth } from '../middleware/auth.js'

const router = Router()

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function chatController(req, res) {
  try {
    const { contractId, message, conversationHistory, analysisData } = req.body
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const systemContent = analysisData ? 
      `You are SamvidAI, an expert legal analyst helping a user 
      understand their contract.
      
      CONTRACT INFO:
      Type: ${analysisData.contract_type || 'Unknown'}
      Risk Score: ${analysisData.overall_risk_score || 'N/A'}/100
      Risk Level: ${analysisData.risk_level || 'N/A'}
      Summary: ${analysisData.summary || ''}
      High Risk Clauses: ${JSON.stringify(analysisData.clauses?.high_risk?.map(c => c.title) || [])}
      Red Flags: ${JSON.stringify(analysisData.red_flags || [])}
      
      Rules:
      - Answer only about this contract
      - Be concise, max 100 words per response
      - Use plain language, no legal jargon
      - Be helpful and actionable` 
      : 
      `You are SamvidAI, an expert legal contract analyst. 
       Answer questions about contracts concisely.`

    const messages = [
      { role: 'system', content: systemContent },
      ...(conversationHistory || []).slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 300,
      temperature: 0.3
    })

    const aiResponse = completion.choices[0]?.message?.content

    res.json({ success: true, message: aiResponse, role: 'assistant' })

  } catch (error) {
    console.error('Chat error:', error.message)
    res.status(500).json({ error: 'Chat failed. Please try again.' })
  }
}

export async function getChatHistory(req, res) {
  try {
    const { contractId } = req.params
    const supabase = req.supabase
    
    const { data, error } = await supabase
      .from('contract_chats')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) return res.status(500).json({ error })
    res.json({ success: true, messages: data })
  } catch (err) {
    console.error('Fetch history error:', err)
    res.status(500).json({ error: 'Failed to fetch chat history' })
  }
}

// Routes
router.post('/chat', verifyAuth, chatController)
router.get('/chat/:contractId', verifyAuth, getChatHistory)

export default router
