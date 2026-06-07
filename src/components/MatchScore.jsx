import { motion } from 'framer-motion';

/**
 * Animated circular score indicator.
 * Renders an SVG ring that fills to the score percentage,
 * color-coded by quality (green/yellow/red).
 */
export default function MatchScore({ score, size = 72, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getGlow = () => {
    if (score >= 80) return '0 0 12px rgba(34, 197, 94, 0.4)';
    if (score >= 60) return '0 0 12px rgba(245, 158, 11, 0.4)';
    return '0 0 12px rgba(239, 68, 68, 0.4)';
  };

  const getLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  };

  const color = getColor();

  return (
    <div className="match-score" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: `drop-shadow(${getGlow()})` }}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Animated score ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="match-score-value" style={{ color }}>
        {score}
      </div>
      <div className="match-score-label" style={{ color }}>{getLabel()}</div>
    </div>
  );
}
