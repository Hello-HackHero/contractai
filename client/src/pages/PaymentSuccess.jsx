import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function PaymentSuccess() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0D2A3E] flex flex-col 
      items-center justify-center text-center px-4">
      
      <div className="text-6xl mb-6">🎉</div>
      
      <h1 className="text-3xl font-bold text-white mb-3">
        Payment Successful!
      </h1>
      
      <p className="text-gray-400 mb-2">
        Welcome to <span className="text-[#C9A843] font-semibold">
        SamvidAI Pro</span>
      </p>
      
      <p className="text-gray-500 text-sm mb-8 max-w-md">
        Your account will be upgraded to Pro within 5 minutes. 
        You'll receive a confirmation email shortly.
      </p>
      
      <button
        onClick={() => navigate('/dashboard')}
        className="px-8 py-3 bg-[#C9A843] text-[#0D2A3E] 
          font-bold rounded-lg hover:bg-[#b8933a] 
          transition-all duration-200"
      >
        Go to Dashboard →
      </button>
      
      <button
        onClick={() => navigate('/')}
        className="mt-4 text-gray-500 text-sm 
          hover:text-gray-300 transition-colors"
      >
        Back to Home
      </button>
    </div>
  )
}
