import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export function useChat(contractId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const { session } = useAuth()

  const sendMessage = useCallback(async (text, analysisData) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          contractId,
          message: text,
          conversationHistory: messages,
          analysisData
        })
      })

      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Chat failed')

      const aiMsg = { 
        role: 'assistant', 
        content: data.message 
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }, [contractId, messages, loading, session])

  return { messages, loading, input, setInput, sendMessage }
}
