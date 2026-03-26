export default function GlassCard({ children, className = '', hover = false, ...props }) {
    return (
        <div
            className={`glass-card p-6 ${hover ? 'hover:shadow-2xl hover:scale-[1.02] hover:border-[#C9A843]/20 cursor-pointer' : ''} transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
