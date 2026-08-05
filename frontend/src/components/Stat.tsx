interface StatProps {
  label: string
  value: string | number
  icon?: string
}

export default function Stat({ label, value, icon }: StatProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  )
}
