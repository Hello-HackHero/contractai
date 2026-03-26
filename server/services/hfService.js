import { InferenceClient } from "@huggingface/inference"

const client = new InferenceClient(process.env.HF_TOKEN)
const MODEL = process.env.HF_MODEL

export async function analyzeWithHF(contractText) {
  try {
    const prompt = `You are a legal contract analysis expert.
    
Analyze the following contract and provide:
1. RISK SCORE: A number from 0-100 (100 = highest risk)
2. RISK LEVEL: LOW / MEDIUM / HIGH / CRITICAL
3. KEY CLAUSES: List important clauses found
4. RED FLAGS: List concerning terms or missing clauses
5. SUMMARY: 2-3 sentence plain English summary

CONTRACT TEXT:
${contractText.slice(0, 4000)}

Respond ONLY in this exact JSON format:
{
  "riskScore": 45,
  "riskLevel": "MEDIUM",
  "keyClauses": ["clause1", "clause2"],
  "redFlags": ["flag1", "flag2"],
  "summary": "This contract..."
}`

    const response = await client.chatCompletion({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.3
    })

    const raw = response.choices[0].message.content
    
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in HF response")
    
    return JSON.parse(jsonMatch[0])
    
  } catch (error) {
    console.error("HuggingFace error:", error)
    // Fallback to Groq if HF fails
    return null
  }
}
