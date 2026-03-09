export default function Spinner({ text = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900/30"></div>
                {/* Spinning arc */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
                {/* Inner glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-500/20 animate-pulse-slow"></div>
            </div>
            <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                {text}
            </p>
        </div>
    )
}
