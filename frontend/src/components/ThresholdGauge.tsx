interface ThresholdGaugeProps {
  ratio: number // 0-10000 (percentage * 100)
}

export default function ThresholdGauge({ ratio }: ThresholdGaugeProps) {
  const pct = Math.min(ratio / 100, 200)
  const barWidth = Math.min(pct, 100)
  const fillClass = pct < 100 ? 'danger' : pct < 150 ? 'warning' : ''

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted">Solvency Ratio</span>
        <span className="text-sm" style={{ fontWeight: 600 }}>
          {(ratio / 100).toFixed(1)}%
        </span>
      </div>
      <div className="solvency-bar">
        <div
          className={`solvency-fill ${fillClass}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  )
}
