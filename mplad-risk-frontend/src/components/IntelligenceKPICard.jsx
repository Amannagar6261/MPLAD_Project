function IntelligenceKPICard({
  label,
  value,
  description,
  accent,
  onClick
}) {
  return (
    <button
      className={`intelligence-kpi-card ${accent || ""}`}
      onClick={onClick}
    >
      <div className="intelligence-kpi-top">
        <span>{label}</span>

        {onClick && (
          <span className="kpi-arrow">↗</span>
        )}
      </div>

      <strong>{value}</strong>

      <small>{description}</small>
    </button>
  );
}

export default IntelligenceKPICard;