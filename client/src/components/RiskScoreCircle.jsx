import { useEffect, useState } from 'react'

export default function RiskScoreCircle({ score = 0, size = 140, strokeWidth = 10 }) {
    const [animatedScore, setAnimatedScore] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100)
        return () => clearTimeout(timer)
    }, [score])

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (animatedScore / 100) * circumference

    const getColor = (score) => {
        if (score < 40) return { stroke: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Low Risk', textColor: 'text-success-500' }
        if (score < 70) return { stroke: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'Medium Risk', textColor: 'text-yellow-500' }
        return { stroke: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'High Risk', textColor: 'text-danger-500' }
    }

    const colorInfo = getColor(animatedScore)

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background glow */}
                <div
                    className="absolute inset-2 rounded-full blur-xl opacity-30"
                    style={{ backgroundColor: colorInfo.stroke }}
                />

                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colorInfo.stroke}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 6px ${colorInfo.stroke}40)` }}
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${colorInfo.textColor}`}>
                        {Math.round(animatedScore)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">/100</span>
                </div>
            </div>

            <span className={`text-sm font-semibold ${colorInfo.textColor}`}>
                {colorInfo.label}
            </span>
        </div>
    )
}
