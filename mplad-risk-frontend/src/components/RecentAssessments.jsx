function RecentAssessments({
  assessments,
  onOpen
}) {
  return (
    <section className="intelligence-panel">

      <div className="intelligence-panel-header">

        <div>
          <span className="panel-eyebrow">
            ACTIVITY
          </span>

          <h3>Recent Assessments</h3>
        </div>

      </div>

      <div className="recent-assessment-list">

        {assessments.map((assessment) => (

          <button
            key={assessment.projectId}
            className="recent-assessment-row"
            onClick={() =>
              onOpen(assessment.projectId)
            }
          >

            <div className="recent-assessment-main">

              <strong>
                {assessment.projectCode}
              </strong>

              <span>
                {assessment.activity}
              </span>

            </div>

            <div className="recent-assessment-score">

              <strong>
                {assessment.riskScore}
              </strong>

              <span>
                /100
              </span>

              <small
                className={`risk-level-text ${assessment.riskLevel.toLowerCase()}`}
              >
                {assessment.riskLevel}
              </small>

            </div>

          </button>

        ))}

      </div>

    </section>
  );
}

export default RecentAssessments;