/**
 * ConfidenceBadge — Visual confidence score indicator with color coding.
 */
const ConfidenceBadge = ({ confidence, size = 'md' }) => {
  const getColor = (score) => {
    if (score >= 90) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' };
    if (score >= 70) return { bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/30' };
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };

  const colors = getColor(confidence);

  return (
    <span
      className={`
        inline-flex items-center rounded-full ring-1
        ${colors.bg} ${colors.text} ${colors.ring}
        ${sizeClasses[size]}
        font-medium
      `}
    >
      {confidence.toFixed(1)}%
    </span>
  );
};

export default ConfidenceBadge;
