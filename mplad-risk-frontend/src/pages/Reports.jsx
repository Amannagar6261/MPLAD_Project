import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Reports.css";

const API_BASE_URL = "http://localhost:8080";

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatNumber(value, digits = 1) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits
  }).format(Number(value));
}

function formatPercent(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(1)}%`;
}

function getRiskClass(level) {
  return String(level || "LOW").toLowerCase();
}

function Reports() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryProjectId = new URLSearchParams(
    location.search
  ).get("projectId");

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState(queryProjectId || "");

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [project, setProject] = useState(null);
  const [risk, setRisk] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [mlRisk, setMlRisk] = useState(null);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * LOAD PROJECTS
   */

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/projects`
        );

        if (!response.ok) {
          throw new Error(
            `Projects API returned ${response.status}`
          );
        }

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : [];

        if (!cancelled) {
          setProjects(list);

          if (
            !queryProjectId &&
            list.length > 0
          ) {
            setSelectedProjectId(
              String(list[0].id)
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to load projects. Please make sure the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, [queryProjectId]);

  /*
   * LOAD REPORT DATA
   */

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    let cancelled = false;

    async function loadReport() {
      try {
        setLoadingReport(true);
        setError("");

        setProject(null);
        setRisk(null);
        setComparison(null);
        setMlRisk(null);

        const [
          projectResponse,
          riskResponse,
          comparisonResponse,
          mlResponse
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/projects/${selectedProjectId}`
          ),
          fetch(
            `${API_BASE_URL}/api/projects/${selectedProjectId}/risk`
          ),
          fetch(
            `${API_BASE_URL}/api/projects/${selectedProjectId}/comparison`
          ),
          fetch(
            `${API_BASE_URL}/api/projects/${selectedProjectId}/ml-risk`
          )
        ]);

        if (
          !projectResponse.ok ||
          !riskResponse.ok ||
          !comparisonResponse.ok ||
          !mlResponse.ok
        ) {
          throw new Error(
            "One or more report endpoints failed."
          );
        }

        const [
          projectData,
          riskData,
          comparisonData,
          mlData
        ] = await Promise.all([
          projectResponse.json(),
          riskResponse.json(),
          comparisonResponse.json(),
          mlResponse.json()
        ]);

        if (!cancelled) {
          setProject(projectData);
          setRisk(riskData);
          setComparison(comparisonData);
          setMlRisk(
            mlData?.mlResult || mlData
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to generate the report for this project."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingReport(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  /*
   * UPDATE URL
   */

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    const currentId =
      new URLSearchParams(
        location.search
      ).get("projectId");

    if (
      String(currentId) !==
      String(selectedProjectId)
    ) {
      navigate(
        `/reports?projectId=${selectedProjectId}`,
        {
          replace: true
        }
      );
    }
  }, [
    selectedProjectId,
    location.search,
    navigate
  ]);

  /*
   * SEARCH
   */

  const filteredProjects = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return projects
      .filter((item) => {
        const text = [
          item.projectCode,
          item.projectName,
          item.projectType,
          item.district,
          item.state
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query);
      })
      .slice(0, 12);
  }, [projects, search]);

  function selectProject(item) {
    setSelectedProjectId(
      String(item.id)
    );

    setSearch("");
    setShowResults(false);
  }

  /*
   * PRINT REPORT
   *
   * IMPORTANT:
   * We create a completely separate print iframe.
   * Only .report-document is copied into it.
   * This prevents the application's fixed
   * header/sidebar/main-content scroll container
   * from affecting Chrome print pagination.
   */

  function printReport() {
    const reportElement =
      document.querySelector(".report-document");

    if (!reportElement) {
      return;
    }

    const iframe =
      document.createElement("iframe");

    iframe.className =
      "reports-print-frame";

    iframe.setAttribute(
      "aria-hidden",
      "true"
    );

    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";

    document.body.appendChild(iframe);

    const printDocument =
      iframe.contentDocument ||
      iframe.contentWindow.document;

    /*
     * Collect styles from the current page.
     */
    let styles = "";

    Array.from(document.styleSheets).forEach(
      (styleSheet) => {
        try {
          if (styleSheet.cssRules) {
            styles += Array.from(
              styleSheet.cssRules
            )
              .map((rule) => rule.cssText)
              .join("\n");
          }
        } catch (error) {
          /*
           * Ignore stylesheets that the browser
           * does not allow us to inspect.
           */
        }
      }
    );

    /*
     * Dedicated print CSS.
     */
    const printStyles = `
      @page {
        size: A4;
        margin: 12mm;
      }

      html,
      body {
        width: 100%;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #ffffff !important;
      }

      body {
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        color: #172033;
      }

      .report-document {
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;

        width: 100% !important;
        max-width: none !important;

        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;

        margin: 0 !important;
        padding: 0 !important;

        overflow: visible !important;

        box-sizing: border-box !important;
      }

      .report-cover,
      .report-score-section,
      .report-section,
      .report-guidance,
      .report-disclaimer {
        width: 100% !important;
        max-width: none !important;

        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;

        overflow: visible !important;

        box-sizing: border-box !important;

        box-shadow: none !important;
      }

      .report-cover {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-score-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-score-card {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-breakdown {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-section {
        break-inside: auto;
        page-break-inside: auto;

        margin: 0 !important;
      }

      .report-section-title {
        break-after: avoid;
        page-break-after: avoid;
      }

      .report-fact,
      .report-reason,
      .report-comparison-grid > div,
      .report-ml-card {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-guidance {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-disclaimer {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-reasons,
      .report-comparison-summary,
      .report-comparison-grid,
      .report-ml-card,
      .report-facts-grid {
        overflow: visible !important;
        max-height: none !important;
      }

      .report-document * {
        overflow: visible !important;
        max-height: none !important;
      }

      .report-document {
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /*
       * Keep important headings with their content.
       */
      h1,
      h2,
      h3 {
        break-after: avoid;
        page-break-after: avoid;
      }

      /*
       * Do not create artificial page breaks.
       * Chrome will paginate naturally across
       * as many A4 pages as necessary.
       */
      section {
        orphans: 3;
        widows: 3;
      }
    `;

    printDocument.open();

    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            ${project?.projectName || "MPLAD Project Report"}
          </title>

          <style>
            ${styles}
          </style>

          <style>
            ${printStyles}
          </style>
        </head>

        <body>
          ${reportElement.outerHTML}
        </body>
      </html>
    `);

    printDocument.close();

    /*
     * Wait for the browser to fully render the
     * report before opening print preview.
     */
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();

        iframe.contentWindow.print();
      } catch (error) {
        console.error(
          "Print failed:",
          error
        );
      }

      /*
       * Remove iframe after printing.
       */
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(
            iframe
          );
        }
      }, 1500);
    }, 700);
  }

  /*
   * LOADING
   */

  if (loadingProjects) {
    return (
      <div className="reports-page">
        <div className="reports-loading">
          <div className="reports-spinner" />

          <h2>
            Loading reporting workspace
          </h2>

          <p>
            Preparing project intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* HEADER */}

      <header className="reports-header">

        <div>
          <span className="reports-eyebrow">
            PROJECT INTELLIGENCE
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Generate a consolidated evidence report
            from the project's risk, comparison and
            machine-learning analysis.
          </p>
        </div>

        <div className="reports-actions">

          <button
            className="reports-secondary-button"
            onClick={() =>
              selectedProjectId &&
              navigate(
                `/risk-analysis?projectId=${selectedProjectId}`
              )
            }
          >
            Risk Analysis
          </button>

          <button
            className="reports-print-button"
            onClick={printReport}
            disabled={
              !project ||
              !risk ||
              loadingReport
            }
          >
            Print / Save PDF
          </button>

        </div>

      </header>

      {/* PROJECT SELECTOR */}

      <section className="reports-selector">

        <div className="reports-selector-copy">

          <span>
            REPORT PROJECT
          </span>

          <strong>
            Select a project
          </strong>

          <small>
            Search by code, name, type,
            district or state.
          </small>

        </div>

        <div className="reports-picker">

          <div className="reports-search-box">

            <span>
              ⌕
            </span>

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );

                setShowResults(true);
              }}
              onFocus={() => {
                if (search.trim()) {
                  setShowResults(true);
                }
              }}
              placeholder={
                project
                  ? `${project.projectCode} — ${project.projectName}`
                  : "Search project..."
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setShowResults(false);
                }}
              >
                ×
              </button>
            )}

          </div>

          {showResults &&
            search.trim() && (

              <div className="reports-search-results">

                {filteredProjects.length > 0 ? (

                  filteredProjects.map(
                    (item) => (

                      <button
                        type="button"
                        key={item.id}
                        className="reports-search-result"
                        onClick={() =>
                          selectProject(item)
                        }
                      >

                        <div>

                          <strong>
                            {item.projectCode}
                          </strong>

                          <span>
                            {item.projectName}
                          </span>

                        </div>

                        <small>
                          {item.projectType ||
                            "Project"} →
                        </small>

                      </button>

                    )
                  )

                ) : (

                  <div className="reports-no-results">

                    <strong>
                      No projects found
                    </strong>

                    <span>
                      Try another project code
                      or name.
                    </span>

                  </div>

                )}

              </div>

            )}

        </div>

      </section>

      {/* ERROR */}

      {error && (

        <div className="reports-error">

          <strong>
            Report unavailable
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}

      {/* LOADING */}

      {loadingReport && (

        <div className="reports-analysis-loading">

          <div className="reports-spinner" />

          <span>
            Generating project intelligence report...
          </span>

        </div>

      )}

      {/* =====================================================
          REPORT DOCUMENT
          ===================================================== */}

      {!loadingReport &&
        project &&
        risk && (

          <main className="report-document">

            {/* REPORT COVER */}

            <section className="report-cover">

              <div className="report-cover-top">

                <div>

                  <span>
                    MPLAD PROJECT INTELLIGENCE
                  </span>

                  <h2>
                    Project Risk Assessment Report
                  </h2>

                  <p>
                    Consolidated analytical view
                    of project-level evidence.
                  </p>

                </div>

                <div className="report-status-badge">

                  <span>
                    RISK LEVEL
                  </span>

                  <strong
                    className={`risk-${getRiskClass(
                      risk.riskLevel
                    )}`}
                  >
                    {risk.riskLevel}
                  </strong>

                </div>

              </div>

              <div className="report-project-identity">

                <div>

                  <span>
                    PROJECT
                  </span>

                  <h1>
                    {project.projectName}
                  </h1>

                  <p>
                    {project.projectCode}
                  </p>

                </div>

                <div className="report-project-meta">

                  <span>
                    {project.projectType ||
                      "Project"}
                  </span>

                  <span>
                    {project.district ||
                      "—"}

                    {project.state
                      ? `, ${project.state}`
                      : ""}
                  </span>

                </div>

              </div>

            </section>

            {/* SCORE */}

            <section className="report-score-section">

              <div className="report-score-card">

                <div className="report-score-number">

                  <strong>
                    {risk.score}
                  </strong>

                  <span>
                    / 100
                  </span>

                </div>

                <div>

                  <span>
                    OVERALL RISK SCORE
                  </span>

                  <h3>
                    {risk.riskLevel}
                  </h3>

                  <p>
                    The score combines direct
                    financial and timeline evidence,
                    comparable-project evidence,
                    machine-learning signals and
                    data-quality indicators.
                  </p>

                </div>

              </div>

              <div className="report-breakdown">

                <div>
                  <span>
                    Direct
                  </span>

                  <strong>
                    {risk.scoreBreakdown
                      ?.directFinancialTimeline ?? 0}
                    /35
                  </strong>
                </div>

                <div>
                  <span>
                    Comparable
                  </span>

                  <strong>
                    {risk.scoreBreakdown
                      ?.comparableProjects ?? 0}
                    /35
                  </strong>
                </div>

                <div>
                  <span>
                    ML
                  </span>

                  <strong>
                    {risk.scoreBreakdown
                      ?.machineLearning ?? 0}
                    /25
                  </strong>
                </div>

                <div>
                  <span>
                    Data
                  </span>

                  <strong>
                    {risk.scoreBreakdown
                      ?.dataQuality ?? 0}
                    /5
                  </strong>
                </div>

              </div>

            </section>

            {/* PROJECT SNAPSHOT */}

            <section className="report-section">

              <div className="report-section-title">

                <span>
                  PROJECT SNAPSHOT
                </span>

                <h2>
                  Financial & timeline profile
                </h2>

              </div>

              <div className="report-facts-grid">

                <div className="report-fact">
                  <span>
                    SANCTIONED AMOUNT
                  </span>

                  <strong>
                    {formatCurrency(
                      project.sanctionedAmount
                    )}
                  </strong>
                </div>

                <div className="report-fact">
                  <span>
                    EXPENDITURE
                  </span>

                  <strong>
                    {formatCurrency(
                      project.expenditure
                    )}
                  </strong>
                </div>

                <div className="report-fact">
                  <span>
                    UTILIZATION
                  </span>

                  <strong>
                    {formatPercent(
                      project.sanctionedAmount
                        ? (
                            Number(
                              project.expenditure
                            ) /
                            Number(
                              project.sanctionedAmount
                            )
                          ) * 100
                        : null
                    )}
                  </strong>
                </div>

                <div className="report-fact">
                  <span>
                    STATUS
                  </span>

                  <strong>
                    {project.status ||
                      "—"}
                  </strong>
                </div>

                <div className="report-fact">
                  <span>
                    START DATE
                  </span>

                  <strong>
                    {project.startDate ||
                      "—"}
                  </strong>
                </div>

                <div className="report-fact">
                  <span>
                    COMPLETION DATE
                  </span>

                  <strong>
                    {project.completionDate ||
                      "—"}
                  </strong>
                </div>

              </div>

            </section>

            {/* EXPLAINABLE EVIDENCE */}

            <section className="report-section">

              <div className="report-section-title">

                <span>
                  EXPLAINABLE EVIDENCE
                </span>

                <h2>
                  Contributing indicators
                </h2>

              </div>

              <div className="report-reasons">

                {(risk.reasons || []).length > 0 ? (

                  risk.reasons.map(
                    (reason, index) => (

                      <div
                        className="report-reason"
                        key={`${reason}-${index}`}
                      >

                        <span>
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <p>
                          {reason}
                        </p>

                      </div>

                    )
                  )

                ) : (

                  <div className="report-no-reasons">
                    No specific contributing
                    indicators were returned
                    by the assessment.
                  </div>

                )}

              </div>

            </section>

            {/* COMPARISON */}

            {comparison && (

              <section className="report-section">

                <div className="report-section-title">

                  <span>
                    COMPARABLE PROJECT EVIDENCE
                  </span>

                  <h2>
                    Statistical peer comparison
                  </h2>

                </div>

                <div className="report-comparison-summary">

                  <div className="report-comparison-method">

                    <span>
                      PEER SELECTION
                    </span>

                    <strong>
                      {comparison.peerSelectionLevel ||
                        "—"}
                    </strong>

                    <p>
                      {comparison.peerSelectionCriteria ||
                        "Relevant projects selected using available project characteristics."}
                    </p>

                  </div>

                  <div className="report-comparison-count">

                    <strong>
                      {comparison.comparableProjectCount ??
                        comparison.costPeerCount ??
                        0}
                    </strong>

                    <span>
                      Comparable projects
                    </span>

                  </div>

                </div>

                <div className="report-comparison-grid">

                  <div>

                    <span>
                      COST / UNIT
                    </span>

                    <strong>
                      {formatNumber(
                        comparison.currentCostPerUnit
                      )}
                    </strong>

                    <small>
                      {comparison.costPercentilePosition !=
                      null
                        ? `${comparison.costPercentilePosition}th percentile`
                        : "No percentile available"}
                    </small>

                  </div>

                  <div>

                    <span>
                      EXPENDITURE
                    </span>

                    <strong>
                      {formatPercent(
                        Number(
                          comparison.currentExpenditureRatio
                        ) * 100
                      )}
                    </strong>

                    <small>
                      {comparison.expenditurePercentilePosition !=
                      null
                        ? `${comparison.expenditurePercentilePosition}th percentile`
                        : "No percentile available"}
                    </small>

                  </div>

                  <div>

                    <span>
                      DURATION
                    </span>

                    <strong>
                      {formatNumber(
                        comparison.currentDurationDays,
                        0
                      )}{" "}
                      days
                    </strong>

                    <small>
                      {comparison.durationPercentilePosition !=
                      null
                        ? `${comparison.durationPercentilePosition}th percentile`
                        : "No percentile available"}
                    </small>

                  </div>

                </div>

              </section>

            )}

            {/* MACHINE LEARNING */}

            {mlRisk && (

              <section className="report-section">

                <div className="report-section-title">

                  <span>
                    MACHINE LEARNING EVIDENCE
                  </span>

                  <h2>
                    Anomaly detection analysis
                  </h2>

                </div>

                <div className="report-ml-card">

                  <div className="report-ml-status">

                    <div className="report-ml-icon">
                      ✦
                    </div>

                    <div>

                      <span>
                        ANOMALY SIGNAL
                      </span>

                      <strong>
                        {mlRisk.isAnomaly
                          ? "Detected"
                          : "Not detected"}
                      </strong>

                    </div>

                  </div>

                  <div className="report-ml-values">

                    <div>

                      <span>
                        ML RISK
                      </span>

                      <strong>
                        {mlRisk.mlRiskScore ??
                          mlRisk.riskScore ??
                          "—"}
                        /100
                      </strong>

                    </div>

                    <div>

                      <span>
                        ANOMALY SCORE
                      </span>

                      <strong>
                        {formatNumber(
                          mlRisk.anomalyScore,
                          4
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        MODEL
                      </span>

                      <strong>
                        {mlRisk.model ||
                          "Isolation Forest"}
                      </strong>

                    </div>

                  </div>

                  <p className="report-ml-note">
                    The machine-learning component
                    identifies unusual patterns in
                    measurable project features. Its
                    output is an analytical signal and
                    should be interpreted together with
                    the other evidence.
                  </p>

                </div>

              </section>

            )}

            {/* GUIDANCE */}

            <section className="report-guidance">

              <div className="report-guidance-icon">
                ◈
              </div>

              <div>

                <span>
                  INVESTIGATION PRIORITY
                </span>

                <h2>
                  Further examination may be
                  appropriate
                </h2>

                <p>
                  Use the evidence in this report
                  to understand which measurable
                  indicators contributed to the
                  project's risk score before
                  deciding whether additional
                  review is required.
                </p>

              </div>

            </section>

            {/* DISCLAIMER */}

            <footer className="report-disclaimer">

              <strong>
                Analytical Disclaimer
              </strong>

              <p>
                The system identifies unusual
                patterns and risk indicators for
                further examination. It does not
                establish fraud or misconduct.
                Statistical comparisons are
                analytical indicators and are not
                official MPLADS cost benchmarks.
              </p>

            </footer>

          </main>

        )}

    </div>
  );
}

export default Reports;