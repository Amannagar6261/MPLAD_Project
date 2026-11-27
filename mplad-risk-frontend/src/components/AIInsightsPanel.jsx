function AIInsightsPanel({
  insights,
  onExplore
}) {
  return (
    <section className="intelligence-panel ai-insights-panel">

      <div className="intelligence-panel-header">

        <div>
          <span className="panel-eyebrow">
            AI ANALYSIS
          </span>

          <h3>AI Insights</h3>

          <p>
            Patterns identified across project assessments.
          </p>
        </div>

        <div className="ai-pulse">
          ✦
        </div>

      </div>

      <div className="ai-insights-list">

        {insights.length === 0 ? (

          <div className="insights-empty">
            <strong>
              No aggregate insights available
            </strong>

            <span>
              Additional assessment data is required
              to generate insight summaries.
            </span>
          </div>

        ) : (

          insights.map((insight) => (

            <div
              className="ai-insight-item"
              key={insight.type}
            >

              <div className="ai-insight-icon">
                ⚠
              </div>

              <div>
                <strong>
                  {insight.title}
                </strong>

                <p>
                  {insight.description}
                </p>
              </div>

            </div>

          ))

        )}

      </div>

      <button
        className="ai-evidence-button"
        onClick={onExplore}
      >
        View Evidence
        <span>→</span>
      </button>

    </section>
  );
}

export default AIInsightsPanel;