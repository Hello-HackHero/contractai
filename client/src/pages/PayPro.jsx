import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PayPro() {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  const UPI_ID = "6370536092@jupiteraxis"
  const WHATSAPP = "916370536092"
  const AMOUNT = "499"

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#0D2A3E] flex items-center 
      justify-center px-4 py-20">
      <div className="w-full max-w-md">
        
        {/* Back button */}
        <button
          onClick={() => navigate('/pricing')}
          className="text-gray-500 text-sm hover:text-gray-300 
            mb-8 flex items-center gap-1 transition-colors"
        >
          ← Back to Pricing
        </button>

        {/* Badge */}
        <div className="text-center mb-6">
          <span className="px-4 py-1 rounded-full text-xs font-bold 
            border border-[#C9A843] text-[#C9A843] uppercase tracking-wider">
            SamvidAI Pro Plan
          </span>
        </div>

        {/* Price */}
        <div className="text-center mb-8">
          <span className="text-6xl font-bold text-[#C9A843]">₹499</span>
          <span className="text-gray-400 text-lg">/month</span>
          <p className="text-gray-500 text-sm mt-2">
            Manual activation within 2 hours of payment
          </p>
        </div>

        {/* Features */}
        <div className="bg-[#0B2236] rounded-xl p-5 mb-6 border border-white/10">
          {[
            "25 contracts per month",
            "Full risk scoring (0-100)",
            "Chat with your contract",
            "Download PDF reports",
            "Priority support"
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
              <CheckCircle className="w-4 h-4 text-[#C9A843] shrink-0" />
              <span className="text-gray-300 text-sm">{f}</span>
            </div>
          ))}
        </div>

        {/* UPI Box */}
        <div className="bg-[#0B2236] rounded-xl p-5 mb-4 
          border border-[#C9A843]/40">
          <p className="text-[#C9A843] text-xs font-bold uppercase 
            tracking-wider mb-3">Step 1 — Pay via UPI</p>
          
          <div className="flex items-center justify-between 
            bg-[#0D2A3E] rounded-lg px-4 py-3 mb-3">
            <span className="text-white font-mono text-sm">
              6370536092@jupiteraxis
            </span>
            <button
              onClick={copyUPI}
              className="text-xs px-3 py-1 rounded border 
                border-[#C9A843] text-[#C9A843] 
                hover:bg-[#C9A843]/10 transition-all ml-2 shrink-0"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center">
            GPay / PhonePe / Paytm → Pay ₹499 to above UPI ID
          </p>
        </div>

        {/* WhatsApp Button */}
        <p className="text-[#C9A843] text-xs font-bold uppercase 
          tracking-wider mb-3 text-center">Step 2 — Send Screenshot</p>

        <a
          href={`https://wa.me/916370536092?text=${encodeURIComponent(
            'Hi! I have paid ₹499 for SamvidAI Pro Plan. Please activate my account.\n\nMy registered email: '
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 
            py-4 rounded-xl font-bold text-white
            bg-[#25D366] hover:bg-[#1ebe5d] 
            transition-all duration-200 mb-6"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.107 1.523 5.835L.057 23.215a.75.75 0 00.916.899l5.353-1.43A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.5-5.24-1.375l-.374-.217-3.874 1.034 1.009-3.768-.237-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Send Payment Screenshot on WhatsApp
        </a>

        {/* Note */}
        <p className="text-center text-gray-600 text-xs">
          🔒 Your account will be upgraded to Pro within 2 hours
        </p>

      </div>
    </div>
  )
}
