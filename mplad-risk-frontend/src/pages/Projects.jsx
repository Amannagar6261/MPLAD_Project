import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Projects.css";

const API_BASE_URL = "http://localhost:8080";

function Projects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /*
   * RISK FILTER FROM DASHBOARD
   */

  const queryRiskLevel =
    new URLSearchParams(location.search).get("riskLevel");

  const normalizedRiskLevel =
    queryRiskLevel &&
    ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(
      queryRiskLevel.toUpperCase()
    )
      ? queryRiskLevel.toUpperCase()
      : "ALL";

  const [riskFilter, setRiskFilter] =
    useState(normalizedRiskLevel);

  /*
   * Keep risk filter synchronized with URL.
   */

  useEffect(() => {
    setRiskFilter(normalizedRiskLevel);
  }, [normalizedRiskLevel]);

  /*
   * LOAD PROJECTS
   */

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/projects`
        );

        if (!response.ok) {
          throw new Error(
            `Backend returned HTTP ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setProjects(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "Projects API error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load projects. Please make sure the Spring Boot backend is running on port 8080."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * PROJECT TYPES
   */

  const projectTypes = useMemo(() => {
    return [
      ...new Set(
        projects
          .map(
            (project) =>
              project.projectType
          )
          .filter(Boolean)
      )
    ].sort();
  }, [projects]);

  /*
   * PROJECT STATUSES
   */

  const statuses = useMemo(() => {
    return [
      ...new Set(
        projects
          .map(
            (project) =>
              project.status
          )
          .filter(Boolean)
      )
    ].sort();
  }, [projects]);

  /*
   * FILTER PROJECTS
   */

  const filteredProjects = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return projects.filter(
      (project) => {
        const matchesSearch =
          !search ||
          String(
            project.projectCode || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            project.projectName || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            project.district || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            project.state || ""
          )
            .toLowerCase()
            .includes(search);

        const matchesType =
          typeFilter === "ALL" ||
          project.projectType ===
            typeFilter;

        const matchesStatus =
          statusFilter === "ALL" ||
          project.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesType &&
          matchesStatus
        );
      }
    );
  }, [
    projects,
    searchTerm,
    typeFilter,
    statusFilter
  ]);

  /*
   * RISK PROJECT IDS
   */

  const [riskProjectIds, setRiskProjectIds] =
    useState(null);

  const [riskLoading, setRiskLoading] =
    useState(false);

  useEffect(() => {
    if (riskFilter === "ALL") {
      setRiskProjectIds(null);
      return;
    }

    let cancelled = false;

    async function loadRiskProjectIds() {
      try {
        setRiskLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/intelligence`
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard API returned HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        const ids =
          data?.riskProjectIds?.[
            riskFilter
          ] || [];

        if (!cancelled) {
          setRiskProjectIds(
            new Set(
              ids.map((id) =>
                Number(id)
              )
            )
          );
        }
      } catch (err) {
        console.error(
          "Risk filter API error:",
          err
        );

        if (!cancelled) {
          setRiskProjectIds(
            new Set()
          );
        }
      } finally {
        if (!cancelled) {
          setRiskLoading(false);
        }
      }
    }

    loadRiskProjectIds();

    return () => {
      cancelled = true;
    };
  }, [riskFilter]);

  /*
   * FINAL FILTERED PROJECTS
   */

  const finalFilteredProjects =
    useMemo(() => {
      if (riskFilter === "ALL") {
        return filteredProjects;
      }

      if (
        riskLoading ||
        !riskProjectIds
      ) {
        return [];
      }

      return filteredProjects.filter(
        (project) =>
          riskProjectIds.has(
            Number(project.id)
          )
      );
    }, [
      filteredProjects,
      riskFilter,
      riskProjectIds,
      riskLoading
    ]);

  /*
   * CLEAR FILTERS
   */

  function clearFilters() {
    setSearchTerm("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setRiskFilter("ALL");

    navigate(
      "/projects",
      {
        replace: true
      }
    );
  }

  /*
   * CHANGE RISK FILTER
   */

  function changeRiskFilter(value) {
    const normalized =
      String(value).toUpperCase();

    setRiskFilter(normalized);

    if (normalized === "ALL") {
      navigate(
        "/projects",
        {
          replace: true
        }
      );
    } else {
      navigate(
        `/projects?riskLevel=${normalized}`,
        {
          replace: true
        }
      );
    }
  }

  /*
   * FORMATTING
   */

  const formatAmount = (amount) => {
    const value =
      Number(amount || 0);

    return `₹${value.toLocaleString(
      "en-IN"
    )}`;
  };

  /*
   * PAGE
   */

  return (
    <section className="page-section">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>

          <p className="page-eyebrow">
            PROJECT INTELLIGENCE
          </p>

          <h2>
            Projects
          </h2>

          <p>
            Review project records and access
            detailed project intelligence for
            further assessment.
          </p>

        </div>

        <div className="projects-header-actions">

          <button
            type="button"
            className="projects-import-button"
            onClick={() =>
              navigate("/projects/import")
            }
          >
            ↑ Import Data
          </button>

          <button
            type="button"
            className="projects-new-button"
            onClick={() =>
              navigate("/projects/new")
            }
          >
            + Manual Entry
          </button>

          {!loading &&
            !error && (
              <div className="projects-result-count">
                Showing{" "}
                <strong>
                  {
                    finalFilteredProjects.length
                  }
                </strong>{" "}
                of{" "}
                <strong>
                  {projects.length}
                </strong>{" "}
                projects
              </div>
            )}

        </div>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="dashboard-placeholder">

          <h3>
            Loading projects...
          </h3>

          <p>
            Fetching project records from the
            MPLAD backend.
          </p>

        </div>
      )}

      {/* ERROR */}

      {!loading &&
        error && (
          <div className="dashboard-placeholder">

            <h3>
              Backend Connection Error
            </h3>

            <p>
              {error}
            </p>

          </div>
        )}

      {/* MAIN CONTENT */}

      {!loading &&
        !error && (
          <>

            {/* ACTIVE RISK FILTER */}

            {riskFilter !== "ALL" && (
              <div
                className={`projects-risk-filter-bar risk-filter-${riskFilter.toLowerCase()}`}
              >

                <div>

                  <span>
                    ACTIVE RISK FILTER
                  </span>

                  <strong>
                    {riskFilter} RISK PROJECTS
                  </strong>

                  <small>
                    Showing only projects classified
                    in the{" "}
                    {riskFilter.toLowerCase()}
                    {" "}
                    risk group.
                  </small>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    changeRiskFilter("ALL")
                  }
                >
                  Show All Projects
                </button>

              </div>
            )}

            {/* FILTER PANEL */}

            <div className="projects-filter-panel">

              {/* SEARCH */}

              <div className="projects-search-wrapper">

                <label htmlFor="project-search">
                  SEARCH PROJECTS
                </label>

                <input
                  id="project-search"
                  type="text"
                  placeholder="Search by code, name, district or state..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                />

              </div>

              {/* TYPE */}

              <div className="projects-filter-wrapper">

                <label htmlFor="project-type">
                  PROJECT TYPE
                </label>

                <select
                  id="project-type"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="ALL">
                    All Types
                  </option>

                  {projectTypes.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* STATUS */}

              <div className="projects-filter-wrapper">

                <label htmlFor="project-status">
                  STATUS
                </label>

                <select
                  id="project-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="ALL">
                    All Statuses
                  </option>

                  {statuses.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* RISK */}

              <div className="projects-filter-wrapper">

                <label htmlFor="project-risk">
                  RISK LEVEL
                </label>

                <select
                  id="project-risk"
                  value={riskFilter}
                  onChange={(event) =>
                    changeRiskFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="ALL">
                    All Risk Levels
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                </select>

              </div>

              {/* CLEAR */}

              <button
                type="button"
                className="projects-clear-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

            </div>

            {/* TABLE */}

            <div className="projects-table-panel">

              {riskLoading && (
                <div className="projects-risk-loading">

                  <div className="loading-spinner"></div>

                  <span>
                    Loading{" "}
                    {riskFilter.toLowerCase()}
                    {" "}
                    risk projects...
                  </span>

                </div>
              )}

              {!riskLoading && (
                <div className="projects-table-wrapper">

                  <table className="projects-table">

                    <thead>

                      <tr>

                        <th>
                          PROJECT
                        </th>

                        <th>
                          TYPE
                        </th>

                        <th>
                          LOCATION
                        </th>

                        <th>
                          SANCTIONED
                        </th>

                        <th>
                          EXPENDITURE
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTION
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {finalFilteredProjects.map(
                        (project) => (

                          <tr
                            key={
                              project.id
                            }
                          >

                            <td>

                              <div className="project-primary">
                                {
                                  project.projectName ||
                                  "Unnamed Project"
                                }
                              </div>

                              <div className="project-secondary">
                                {
                                  project.projectCode ||
                                  "—"
                                }
                              </div>

                            </td>

                            <td>

                              <span className="project-type-badge">
                                {
                                  project.projectType ||
                                  "Unknown"
                                }
                              </span>

                            </td>

                            <td>

                              <div className="project-primary">
                                {
                                  project.district ||
                                  "—"
                                }
                              </div>

                              <div className="project-secondary">
                                {
                                  project.state ||
                                  "—"
                                }
                              </div>

                            </td>

                            <td>
                              {formatAmount(
                                project.sanctionedAmount
                              )}
                            </td>

                            <td>
                              {formatAmount(
                                project.expenditure
                              )}
                            </td>

                            <td>

                              <span
                                className={`project-status-badge status-${String(
                                  project.status ||
                                    "unknown"
                                )
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )}`}
                              >
                                {
                                  project.status ||
                                  "Unknown"
                                }
                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="project-view-button"
                                onClick={() =>
                                  navigate(
                                    `/projects/${project.id}`
                                  )
                                }
                              >
                                View
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                  {/* EMPTY STATE */}

                  {finalFilteredProjects.length ===
                    0 && (

                    <div className="projects-empty-state">

                      <h3>
                        No projects found
                      </h3>

                      <p>
                        {riskFilter !==
                        "ALL"
                          ? `There are no ${riskFilter.toLowerCase()} risk projects matching the current filters.`
                          : "Try changing the search term or filters."}
                      </p>

                      {riskFilter !==
                        "ALL" && (

                        <button
                          type="button"
                          onClick={() =>
                            changeRiskFilter(
                              "ALL"
                            )
                          }
                        >
                          Show All Projects
                        </button>

                      )}

                    </div>

                  )}

                </div>
              )}

            </div>

            {/* NOTE */}

            <div className="projects-note">

              <strong>
                Project records:
              </strong>

              <span>
                Information shown here is retrieved
                from the project database. Risk
                indicators and anomaly analysis are
                available through the assessment
                workflow.
              </span>

            </div>

          </>
        )}

    </section>
  );
}

export default Projects;