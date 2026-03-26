import { useRef, useEffect, useState } from 'react'
import { Send, ChevronDown, FileText } from 'lucide-react'
import { useChat } from '../hooks/useChat'

export default function ChatSection({ contracts, contractId: propContractId, contractData: propContractData }) {
  // If contracts are passed (Dashboard), use selection logic. 
  // If single contractId/Data passed (Results), use those.
  const [selectedContractId, setSelectedContractId] = useState(
    contracts?.[0]?.id || propContractId || ''
  )
  const selectedContract = contracts?.find(c => c.id === selectedContractId)
  const contractData = selectedContract?.analysis_result || propContractData
  const fileName = selectedContract?.file_name || 'your contract'

  const { messages, loading, input, setInput, sendMessage: originalSendMessage } = useChat(selectedContractId)
  const bottomRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = (text) => {
    originalSendMessage(text, contractData)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // Suggested questions
  const suggestions = [
    "What is the biggest risk in this contract?",
    "Explain the termination clause",
    "What should I negotiate?",
    "Is this contract fair?"
  ]

  return (
    <div className="mt-8 bg-white dark:bg-[#091F2E] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-2xl">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg">
            Ask Anything About Your Contract
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Powered by SamvidAI — ask about any clause, term, or risk
          </p>
        </div>

        {/* Contract Selector - Only show if multiple contracts provided */}
        {contracts && contracts.length > 1 && (
          <div className="relative w-full sm:w-64">
            <select 
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full bg-white dark:bg-[#0B2236] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none focus:border-[#C9A843]/50 transition-all cursor-pointer pr-10"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.file_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      <div className="flex h-[500px]">
        
        {/* Left: Contract Summary Panel */}
        <div className="w-64 border-r border-gray-200 dark:border-white/10 p-4 overflow-y-auto hidden lg:block bg-gray-50 dark:bg-black/20">
          <h3 className="text-[#C9A843] text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Contract Summary
          </h3>
          <ul className="space-y-2">
            <li className="text-gray-700 dark:text-gray-300 text-xs flex gap-2">
              <span className="text-[#C9A843]">•</span>
              {contractData?.contract_type || 'Unknown'} Contract
            </li>
            <li className="text-gray-700 dark:text-gray-300 text-xs flex gap-2">
              <span className="text-[#C9A843]">•</span>
              Risk: {contractData?.overall_risk_score}/100 ({contractData?.risk_level})
            </li>
            <li className="text-gray-700 dark:text-gray-300 text-xs flex gap-2">
              <span className="text-[#C9A843]">•</span>
              {contractData?.clauses?.high_risk?.length || 0} High Risk Clauses
            </li>
            <li className="text-gray-700 dark:text-gray-300 text-xs flex gap-2">
              <span className="text-[#C9A843]">•</span>
              {contractData?.red_flags?.length || 0} Red Flags Found
            </li>
          </ul>

          {/* Suggested Questions */}
          <h3 className="text-[#C9A843] text-xs font-semibold uppercase tracking-wider mb-3 mt-6">
            Suggested Questions
          </h3>
          <div className="space-y-2">
            {suggestions.map((q, i) => (
              <button key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="w-full text-left text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg px-3 py-2 transition-all duration-200 border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-white/10 disabled:opacity-50 text-wrap">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="flex-1 flex flex-col bg-black/10">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A843] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#C9A843]/20">
                  <span className="text-xs font-bold text-[#0D2A3E]">S</span>
                </div>
                <div className="bg-white dark:bg-[#0B2236] border-l-2 border-[#C9A843] rounded-r-xl rounded-tl-none px-4 py-3 max-w-md shadow-md">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Hi! I've analysed <span className="text-[#C9A843] font-semibold">"{fileName}"</span>. Ask me anything about it — risks, clauses, recommendations, or anything else.
                  </p>
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-lg
                  ${msg.role === 'user' 
                    ? 'bg-[#C9A843] text-[#0D2A3E] shadow-[#C9A843]/20' 
                    : 'bg-[#C9A843] text-[#0D2A3E] shadow-[#C9A843]/20'}`}>
                  {msg.role === 'user' ? 'U' : 'S'}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-xl max-w-sm text-sm shadow-md
                  ${msg.role === 'user'
                    ? 'bg-[#C9A843] text-[#0D2A3E] font-medium rounded-tr-none'
                    : 'bg-white dark:bg-[#0B2236] text-gray-700 dark:text-gray-300 border-l-2 border-[#C9A843] rounded-tl-none border border-gray-100 dark:border-none'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A843] flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="text-xs font-bold text-[#0D2A3E]">S</span>
                </div>
                <div className="bg-white dark:bg-[#0B2236] border-l-2 border-[#C9A843] rounded-r-xl px-4 py-3 shadow-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#C9A843] rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                    <span className="w-1.5 h-1.5 bg-[#C9A843] rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                    <span className="w-1.5 h-1.5 bg-[#C9A843] rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-2" />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-3 bg-white dark:bg-[#0B2236] rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-[#C9A843]/50 transition-all shadow-sm">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a clause, term, or risk..."
                disabled={loading}
                className="flex-1 bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="mr-2 p-2 rounded-lg bg-[#C9A843] text-[#0D2A3E] hover:bg-[#C9A843]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-400 dark:text-gray-600 text-xs mt-2 text-center italic">
              Press Enter to send • AI responses are based on your contract content
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
