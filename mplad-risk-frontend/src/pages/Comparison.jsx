import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Comparison.css";

const API_BASE_URL = "http://localhost:8080";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatNumber(value, digits = 2) {
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

function formatPercent(value, digits = 1) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(digits)}%`;
}

function percentileLabel(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const number = Number(value);

  if (number === 0) return "0th";

  if (number % 100 >= 11 && number % 100 <= 13) {
    return `${number}th`;
  }

  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

function deviationClass(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "comparison-neutral";
  }

  const number = Number(value);

  if (number > 20) {
    return "comparison-warning";
  }

  if (number < -20) {
    return "comparison-low";
  }

  return "comparison-neutral";
}

function MetricCard({
  icon,
  title,
  subtitle,
  current,
  p25,
  median,
  p75,
  percentile,
  deviation,
  unit
}) {
  return (
    <article className="comparison-metric-card">

      <div className="comparison-metric-header">

        <div className="comparison-metric-icon">
          {icon}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        {percentile !== undefined &&
          percentile !== null && (
            <span className="comparison-percentile">
              {percentileLabel(percentile)}
            </span>
          )}

      </div>

      <div className="comparison-current-value">

        <span>
          CURRENT PROJECT
        </span>

        <strong>
          {current}
        </strong>

        {unit && (
          <small>
            {unit}
          </small>
        )}

      </div>

      <div className="comparison-range">

        <div className="comparison-range-row">
          <span>P25</span>
          <strong>{p25}</strong>
        </div>

        <div className="comparison-range-row median">
          <span>Median</span>
          <strong>{median}</strong>
        </div>

        <div className="comparison-range-row">
          <span>P75</span>
          <strong>{p75}</strong>
        </div>

      </div>

      {deviation !== undefined &&
        deviation !== null && (

          <div
            className={`comparison-deviation ${deviationClass(
              deviation
            )}`}
          >

            <span>
              Deviation from median
            </span>

            <strong>
              {Number(deviation) > 0 ? "+" : ""}
              {formatPercent(deviation)}
            </strong>

          </div>

        )}

    </article>
  );
}

function Comparison() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryProjectId =
    new URLSearchParams(location.search).get(
      "projectId"
    );

  const [projects, setProjects] = useState([]);

  const [selectedProjectId, setSelectedProjectId] =
    useState(queryProjectId || "");

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] =
    useState(false);

  const [comparison, setComparison] =
    useState(null);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingComparison, setLoadingComparison] =
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
   * SELECTED PROJECT
   */

  useEffect(() => {

    if (!selectedProjectId) {
      setSelectedProject(null);
      return;
    }

    const project = projects.find(
      (item) =>
        String(item.id) ===
        String(selectedProjectId)
    );

    setSelectedProject(
      project || null
    );

  }, [
    projects,
    selectedProjectId
  ]);

  /*
   * LOAD COMPARISON
   */

  useEffect(() => {

    if (!selectedProjectId) {
      return;
    }

    let cancelled = false;

    async function loadComparison() {

      try {

        setLoadingComparison(true);
        setError("");
        setComparison(null);

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${selectedProjectId}/comparison`
        );

        if (!response.ok) {
          throw new Error(
            `Comparison API returned ${response.status}`
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          setComparison(data);
        }

      } catch (err) {

        if (!cancelled) {
          setError(
            "Unable to load comparable-project analysis for this project."
          );
        }

      } finally {

        if (!cancelled) {
          setLoadingComparison(false);
        }

      }

    }

    loadComparison();

    return () => {
      cancelled = true;
    };

  }, [selectedProjectId]);

  /*
   * KEEP URL SYNCHRONIZED
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
        `/comparison?projectId=${selectedProjectId}`,
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

  const filteredProjects =
    useMemo(() => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return [];
      }

      return projects
        .filter((project) => {

          const searchableText = [
            project.projectCode,
            project.projectName,
            project.projectType,
            project.district,
            project.state
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query
          );

        })
        .slice(0, 12);

    }, [
      projects,
      search
    ]);

  function selectProject(project) {

    setSelectedProjectId(
      String(project.id)
    );

    setSearch("");

    setShowResults(false);
  }

  /*
   * PEER COUNT
   */

  const peerCount =
    comparison?.comparableProjectCount ??
    comparison?.comparableProjectsCount ??
    comparison?.costPeerCount ??
    0;

  const hasEnoughPeers =
    Number(peerCount) >= 8;

  /*
   * LOADING
   */

  if (loadingProjects) {

    return (
      <div className="comparison-page">

        <div className="comparison-loading">

          <div className="comparison-spinner" />

          <h2>
            Loading comparison intelligence
          </h2>

          <p>
            Retrieving project data...
          </p>

        </div>

      </div>
    );

  }

  return (
    <div className="comparison-page">

      {/* HEADER */}

      <header className="comparison-page-header">

        <div>

          <span className="comparison-eyebrow">
            PROJECT INTELLIGENCE
          </span>

          <h1>
            Project Comparison
          </h1>

          <p>
            Compare a project with statistically
            relevant projects using project type,
            scale, location and year.
          </p>

        </div>

        <div className="comparison-header-actions">

          <button
            className="comparison-secondary-button"
            onClick={() =>
              selectedProjectId &&
              navigate(
                `/risk-analysis?projectId=${selectedProjectId}`
              )
            }
          >
            ← Risk Analysis
          </button>

          <button
            className="comparison-secondary-button"
            onClick={() =>
              navigate("/projects")
            }
          >
            Projects
          </button>

        </div>

      </header>

      {/* PROJECT SELECTOR */}

      <section className="comparison-selector-card">

        <div className="comparison-selector-copy">

          <span>
            COMPARE PROJECT
          </span>

          <strong>
            Select a project for contextual
            comparison
          </strong>

          <small>
            Search by project code, name,
            type, district or state.
          </small>

        </div>

        <div className="comparison-project-picker">

          <div className="comparison-search-box">

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
                selectedProject
                  ? `${selectedProject.projectCode} — ${selectedProject.projectName}`
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

              <div className="comparison-search-results">

                {filteredProjects.length > 0 ? (

                  filteredProjects.map(
                    (project) => (

                      <button
                        type="button"
                        key={project.id}
                        className="comparison-search-result"
                        onClick={() =>
                          selectProject(
                            project
                          )
                        }
                      >

                        <div>

                          <strong>
                            {project.projectCode}
                          </strong>

                          <span>
                            {project.projectName}
                          </span>

                        </div>

                        <small>
                          {project.projectType ||
                            "Project"} →
                        </small>

                      </button>

                    )
                  )

                ) : (

                  <div className="comparison-no-results">

                    <strong>
                      No projects found
                    </strong>

                    <span>
                      Try another project
                      code or name.
                    </span>

                  </div>

                )}

              </div>

            )}

          {selectedProject &&
            !search && (

              <div className="comparison-selected-project">

                <span>
                  SELECTED
                </span>

                <strong>
                  {selectedProject.projectCode}
                </strong>

                <p>
                  {selectedProject.projectName}
                </p>

              </div>

            )}

        </div>

      </section>

      {/* ERROR */}

      {error && (

        <div className="comparison-error">

          <strong>
            Comparison unavailable
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}

      {/* LOADING */}

      {loadingComparison && (

        <div className="comparison-analysis-loading">

          <div className="comparison-spinner" />

          <span>
            Building comparable-project
            analysis...
          </span>

        </div>

      )}

      {/* MAIN */}

      {!loadingComparison &&
        comparison && (

          <>

            {/* PROJECT BANNER */}

            <section className="comparison-project-banner">

              <div>

                <span>
                  SELECTED PROJECT
                </span>

                <h2>
                  {selectedProject?.projectName ||
                    comparison.projectName ||
                    "Project"}
                </h2>

                <div className="comparison-project-meta">

                  <strong>
                    {selectedProject?.projectCode ||
                      comparison.projectCode ||
                      "—"}
                  </strong>

                  <span>
                    •
                  </span>

                  <span>
                    {selectedProject?.projectType ||
                      comparison.projectType ||
                      "Project"}
                  </span>

                  {selectedProject?.district && (
                    <>
                      <span>
                        •
                      </span>

                      <span>
                        {selectedProject.district}

                        {selectedProject.state
                          ? `, ${selectedProject.state}`
                          : ""}
                      </span>
                    </>
                  )}

                </div>

              </div>

              <div className="comparison-peer-summary">

                <strong>
                  {peerCount}
                </strong>

                <span>
                  Comparable projects
                </span>

              </div>

            </section>

            {/* PEER SELECTION */}

            <section className="comparison-method-card">

              <div className="comparison-method-icon">
                ⇄
              </div>

              <div className="comparison-method-content">

                <span>
                  PEER SELECTION
                </span>

                <h2>
                  {comparison.peerSelectionLevel ||
                    "Statistical comparison"}
                </h2>

                <p>
                  {comparison.peerSelectionCriteria ||
                    "Projects are selected using relevant project characteristics."}
                </p>

              </div>

              <div
                className={
                  hasEnoughPeers
                    ? "comparison-coverage good"
                    : "comparison-coverage limited"
                }
              >

                <strong>
                  {peerCount}
                </strong>

                <span>
                  {hasEnoughPeers
                    ? "Preferred peer coverage"
                    : "Below preferred coverage"}
                </span>

              </div>

            </section>

            {/* METRICS */}

            <section className="comparison-section">

              <div className="comparison-section-heading">

                <div>

                  <span>
                    STATISTICAL EVIDENCE
                  </span>

                  <h2>
                    Cost, utilization & timeline
                  </h2>

                </div>

                <p>
                  Current project is positioned
                  against the selected peer group.
                </p>

              </div>

              <div className="comparison-metric-grid">

                <MetricCard
                  icon="₹"
                  title="Cost / Unit"
                  subtitle={
                    comparison.costMetric ||
                    "Sanctioned amount per relevant unit"
                  }
                  current={formatNumber(
                    comparison.currentCostPerUnit
                  )}
                  p25={formatNumber(
                    comparison.peerP25Cost
                  )}
                  median={formatNumber(
                    comparison.peerMedianCost
                  )}
                  p75={formatNumber(
                    comparison.peerP75Cost
                  )}
                  percentile={
                    comparison.costPercentilePosition
                  }
                  deviation={
                    comparison.costDeviationPercentage
                  }
                />

                <MetricCard
                  icon="%"
                  title="Expenditure / Utilization"
                  subtitle="Expenditure relative to sanctioned amount"
                  current={formatPercent(
                    Number(
                      comparison.currentExpenditureRatio
                    ) * 100
                  )}
                  p25={formatPercent(
                    Number(
                      comparison.peerP25Expenditure
                    ) * 100
                  )}
                  median={formatPercent(
                    Number(
                      comparison.peerMedianExpenditure
                    ) * 100
                  )}
                  p75={formatPercent(
                    Number(
                      comparison.peerP75Expenditure
                    ) * 100
                  )}
                  percentile={
                    comparison.expenditurePercentilePosition
                  }
                  deviation={
                    comparison.expenditureDeviationPercentage
                  }
                />

                <MetricCard
                  icon="◷"
                  title="Project Duration"
                  subtitle="Elapsed project duration in days"
                  current={formatNumber(
                    comparison.currentDurationDays,
                    0
                  )}
                  p25={formatNumber(
                    comparison.peerP25Duration
                  )}
                  median={formatNumber(
                    comparison.peerMedianDuration
                  )}
                  p75={formatNumber(
                    comparison.peerP75Duration
                  )}
                  percentile={
                    comparison.durationPercentilePosition
                  }
                  deviation={
                    comparison.durationDeviationPercentage
                  }
                  unit="days"
                />

              </div>

            </section>

            {/* PROJECT POSITION */}

            <section className="comparison-position-card">

              <div className="comparison-position-header">

                <div>

                  <span>
                    PROJECT POSITION
                  </span>

                  <h2>
                    Where this project sits
                    within its peer group
                  </h2>

                </div>

                <span className="comparison-peer-count">
                  {peerCount} peers
                </span>

              </div>

              <div className="comparison-position-grid">

                <div className="position-item">

                  <span>
                    Cost
                  </span>

                  <strong>
                    {percentileLabel(
                      comparison.costPercentilePosition
                    )}
                  </strong>

                  <small>
                    percentile position
                  </small>

                </div>

                <div className="position-item">

                  <span>
                    Expenditure
                  </span>

                  <strong>
                    {percentileLabel(
                      comparison.expenditurePercentilePosition
                    )}
                  </strong>

                  <small>
                    percentile position
                  </small>

                </div>

                <div className="position-item">

                  <span>
                    Duration
                  </span>

                  <strong>
                    {percentileLabel(
                      comparison.durationPercentilePosition
                    )}
                  </strong>

                  <small>
                    percentile position
                  </small>

                </div>

              </div>

              <div className="comparison-scale">

                <div className="comparison-scale-labels">
                  <span>
                    Lower relative position
                  </span>

                  <span>
                    Peer median
                  </span>

                  <span>
                    Higher relative position
                  </span>
                </div>

                <div className="comparison-scale-track">

                  <div className="comparison-scale-zone" />

                  {comparison.costPercentilePosition !==
                    undefined && (

                    <div
                      className="comparison-scale-marker"
                      style={{
                        left: `${Math.min(
                          Math.max(
                            Number(
                              comparison.costPercentilePosition
                            ),
                            0
                          ),
                          100
                        )}%`
                      }}
                    >
                      <span>
                        Cost
                      </span>
                    </div>

                  )}

                </div>

              </div>

            </section>

            {/* INSIGHTS */}

            <section className="comparison-insight-grid">

              <div className="comparison-insight-card">

                <div className="comparison-insight-icon">
                  i
                </div>

                <div>

                  <span>
                    INTERPRETATION
                  </span>

                  <h3>
                    Statistical context,
                    not a fixed benchmark
                  </h3>

                  <p>
                    The comparison uses relevant
                    projects from the available
                    dataset. P25, median and P75
                    describe the observed peer
                    distribution and should be
                    interpreted as analytical
                    indicators.
                  </p>

                </div>

              </div>

              <div className="comparison-insight-card">

                <div className="comparison-insight-icon">
                  ✓
                </div>

                <div>

                  <span>
                    PEER COVERAGE
                  </span>

                  <h3>
                    {hasEnoughPeers
                      ? "Sufficient comparison coverage"
                      : "Limited comparison coverage"}
                  </h3>

                  <p>
                    {hasEnoughPeers
                      ? `The current analysis uses ${peerCount} comparable projects, meeting the preferred minimum of 8.`
                      : `Only ${peerCount} comparable projects were found. This is below the preferred minimum of 8 projects.`}
                  </p>

                </div>

              </div>

            </section>

            {/* DISCLAIMER */}

            <div className="comparison-disclaimer">

              <div>
                i
              </div>

              <p>
                Statistical comparisons are
                analytical indicators based on
                relevant projects in the dataset.
                They are not official MPLADS cost
                benchmarks and do not establish
                fraud or misconduct.
              </p>

            </div>

          </>

        )}

    </div>
  );
}

export default Comparison;