import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const API_BASE_URL = "http://localhost:8080";

const RISK_COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#7f1d1d"
};

function formatRisk(value) {
  return Number(value || 0).toFixed(1);
}

function getRiskClass(level) {
  return String(level || "LOW").toLowerCase();
}

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/intelligence`
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setDashboard(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to load dashboard intelligence. Make sure the Spring Boot backend is running on port 8080."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const riskData = useMemo(() => {
    if (!dashboard?.riskDistribution) {
      return [];
    }

    return [
      {
        name: "LOW",
        value: dashboard.riskDistribution.low || 0
      },
      {
        name: "MEDIUM",
        value: dashboard.riskDistribution.medium || 0
      },
      {
        name: "HIGH",
        value: dashboard.riskDistribution.high || 0
      },
      {
        name: "CRITICAL",
        value: dashboard.riskDistribution.critical || 0
      }
    ];
  }, [dashboard]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h2>Loading project intelligence</h2>

          <p>
            Preparing risk analytics from the project database...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="error-icon">!</div>

          <h2>Dashboard unavailable</h2>

          <p>{error}</p>

          <button
            className="primary-action-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const riskTrend = dashboard.riskTrend || [];
  const attentionProjects =
    dashboard.attentionProjects || [];
  const recentAssessments =
    dashboard.recentAssessments || [];
  const insights = dashboard.insights || [];

  return (
    <div className="dashboard-page">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="dashboard-hero">

        <div className="hero-content">

          <div className="hero-eyebrow">
            PROJECT INTELLIGENCE
          </div>

          <h1>
            MPLAD Project Intelligence
          </h1>

          <p>
            AI-assisted project monitoring, anomaly detection
            and risk assessment.
          </p>

        </div>

        <div className="hero-status">

          <span className="hero-status-dot"></span>

          <div>
            <strong>System Online</strong>
            <span>Intelligence engine active</span>
          </div>

        </div>

      </section>


      {/* =====================================================
          KPI STRIP
      ====================================================== */}

      <section className="intelligence-kpi-grid">

        <button
          className="intelligence-kpi-card"
          onClick={() => navigate("/projects")}
        >
          <div className="kpi-header">
            <span>Total Projects</span>
            <span className="kpi-arrow">↗</span>
          </div>

          <strong>
            {dashboard.totalProjects}
          </strong>

          <small>
            Projects in intelligence database
          </small>
        </button>


        <button
          className="intelligence-kpi-card review"
          onClick={() =>
            navigate("/projects?riskFilter=attention")
          }
        >
          <div className="kpi-header">
            <span>Requires Review</span>
            <span className="kpi-arrow">↗</span>
          </div>

          <strong>
            {dashboard.requiresReview}
          </strong>

          <small>
            High or critical risk indicators
          </small>
        </button>


        <button
          className="intelligence-kpi-card anomaly"
          onClick={() =>
            navigate("/risk-analysis")
          }
        >
          <div className="kpi-header">
            <span>Anomalies Detected</span>
            <span className="kpi-arrow">↗</span>
          </div>

          <strong>
            {dashboard.anomaliesDetected}
          </strong>

          <small>
            Projects requiring further examination
          </small>
        </button>


        <button
          className="intelligence-kpi-card average"
          onClick={() =>
            navigate("/risk-analysis")
          }
        >
          <div className="kpi-header">
            <span>Average Risk Score</span>
            <span className="kpi-arrow">↗</span>
          </div>

          <strong>
            {formatRisk(dashboard.averageRiskScore)}
          </strong>

          <small>
            Across {dashboard.assessedProjects} assessed projects
          </small>
        </button>

      </section>


      {/* =====================================================
          MAIN INTELLIGENCE GRID
      ====================================================== */}

      <section className="dashboard-main-grid">

        {/* RISK LANDSCAPE */}

        <div className="dashboard-panel risk-landscape-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                RISK LANDSCAPE
              </span>

              <h2>
                Project risk distribution
              </h2>
            </div>

            <span className="panel-count">
              {dashboard.assessedProjects} assessed
            </span>

          </div>


          <div className="risk-landscape-content">

            <div className="risk-donut">

              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <PieChart>

                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={100}
                    paddingAngle={3}
                    strokeWidth={0}
                  >

                    {riskData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={
                          RISK_COLORS[entry.name]
                        }
                      />
                    ))}

                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Projects"
                    ]}
                  />

                </PieChart>
              </ResponsiveContainer>


              <div className="donut-center">

                <strong>
                  {dashboard.assessedProjects}
                </strong>

                <span>ASSESSED</span>

              </div>

            </div>


            <div className="risk-legend">

              {riskData.map((item) => (

                <button
                  key={item.name}
                  className="risk-legend-item"
                  onClick={() =>
                    navigate(
                      `/projects?riskLevel=${item.name}`
                    )
                  }
                >

                  <span className="risk-legend-left">

                    <span
                      className="risk-dot"
                      style={{
                        backgroundColor:
                          RISK_COLORS[item.name]
                      }}
                    />

                    <span>
                      {item.name}
                    </span>

                  </span>


                  <strong>
                    {item.value}
                  </strong>

                </button>

              ))}

            </div>

          </div>

        </div>


        {/* AI INSIGHTS */}

        <div className="dashboard-panel insights-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                AI INSIGHTS
              </span>

              <h2>
                Intelligence signals
              </h2>
            </div>

            <div className="ai-badge">
              AI
            </div>

          </div>


          <div className="insights-list">

            {insights.length === 0 ? (

              <div className="empty-state">
                <strong>
                  No intelligence signals
                </strong>

                <span>
                  Additional assessment evidence will appear here.
                </span>
              </div>

            ) : (

              insights.map((insight, index) => (

                <div
                  className="insight-item"
                  key={`${insight.type}-${index}`}
                >

                  <div className="insight-icon">
                    {insight.type === "critical"
                      ? "!"
                      : insight.type === "risk"
                        ? "◈"
                        : "✦"}
                  </div>

                  <div className="insight-content">

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
            className="secondary-action-button"
            onClick={() =>
              navigate("/risk-analysis")
            }
          >
            Explore Risk Analysis
            <span>→</span>
          </button>

        </div>

      </section>


      {/* =====================================================
          ATTENTION PROJECTS
      ====================================================== */}

      <section className="dashboard-panel attention-panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              PROJECTS REQUIRING ATTENTION
            </span>

            <h2>
              Highest current risk indicators
            </h2>
          </div>

          <button
            className="panel-link"
            onClick={() =>
              navigate("/projects?riskFilter=attention")
            }
          >
            View all
            <span>→</span>
          </button>

        </div>


        {attentionProjects.length === 0 ? (

          <div className="empty-table-state">
            No projects currently require review.
          </div>

        ) : (

          <div className="attention-table-wrapper">

            <table className="attention-table">

              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>RISK</th>
                  <th>LEVEL</th>
                  <th>INDICATOR</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {attentionProjects.map((project) => (

                  <tr key={project.projectId}>

                    <td>

                      <div className="project-table-name">

                        <strong>
                          {project.projectName}
                        </strong>

                        <span>
                          {project.projectCode}
                        </span>

                      </div>

                    </td>


                    <td>

                      <strong className="table-risk-score">
                        {project.riskScore}
                      </strong>

                    </td>


                    <td>

                      <span
                        className={`risk-level-badge ${getRiskClass(
                          project.riskLevel
                        )}`}
                      >
                        {project.riskLevel}
                      </span>

                    </td>


                    <td>

                      <span className="indicator-text">
                        {project.primaryIndicator}
                      </span>

                    </td>


                    <td>

                      <button
                        className="table-action"
                        onClick={() =>
                          navigate(
                            `/risk-analysis?projectId=${project.projectId}`
                          )
                        }
                      >
                        View Assessment →
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =====================================================
          RECENT + TREND
      ====================================================== */}

      <section className="dashboard-secondary-grid">

        {/* RECENT ASSESSMENTS */}

        <div className="dashboard-panel recent-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                RECENT ASSESSMENTS
              </span>

              <h2>
                Latest risk activity
              </h2>
            </div>

            <button
              className="panel-link"
              onClick={() =>
                navigate("/risk-analysis")
              }
            >
              Explore
              <span>→</span>
            </button>

          </div>


          <div className="recent-list">

            {recentAssessments.map((assessment) => (

              <button
                className="recent-item"
                key={assessment.projectId}
                onClick={() =>
                  navigate(
                    `/risk-analysis?projectId=${assessment.projectId}`
                  )
                }
              >

                <div className="recent-project">

                  <strong>
                    {assessment.projectCode}
                  </strong>

                  <span>
                    {assessment.projectName}
                  </span>

                </div>


                <div className="recent-risk">

                  <strong>
                    {assessment.riskScore}
                  </strong>

                  <span
                    className={`risk-level-badge ${getRiskClass(
                      assessment.riskLevel
                    )}`}
                  >
                    {assessment.riskLevel}
                  </span>

                </div>

              </button>

            ))}

          </div>

        </div>


        {/* RISK TREND */}

        <div className="dashboard-panel trend-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                RISK TREND
              </span>

              <h2>
                Average risk by project year
              </h2>
            </div>

          </div>


          <div className="trend-chart">

            {riskTrend.length === 0 ? (

              <div className="empty-state">
                <strong>
                  No trend data
                </strong>

                <span>
                  Risk trend information will appear when assessment data is available.
                </span>
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={270}
              >

                <AreaChart
                  data={riskTrend}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0
                  }}
                >

                  <defs>

                    <linearGradient
                      id="riskTrendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#4f46e5"
                        stopOpacity={0.24}
                      />

                      <stop
                        offset="100%"
                        stopColor="#4f46e5"
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12
                    }}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12
                    }}
                  />


                  <Tooltip
                    formatter={(value) => [
                      value,
                      "Average Risk"
                    ]}
                    labelFormatter={(label) =>
                      `Project year: ${label}`
                    }
                  />


                  <Area
                    type="monotone"
                    dataKey="averageRisk"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="url(#riskTrendFill)"
                    dot={{
                      r: 4,
                      fill: "#4f46e5"
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          SECONDARY ANALYTICS
      ====================================================== */}

      <section className="dashboard-panel secondary-analytics">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              DATA COVERAGE
            </span>

            <h2>
              Assessment overview
            </h2>
          </div>

        </div>


        <div className="coverage-grid">

          <div className="coverage-card">

            <span>Projects</span>

            <strong>
              {dashboard.totalProjects}
            </strong>

            <small>
              Total projects in database
            </small>

          </div>


          <div className="coverage-card">

            <span>Assessed</span>

            <strong>
              {dashboard.assessedProjects}
            </strong>

            <small>
              Risk assessments available
            </small>

          </div>


          <div className="coverage-card">

            <span>Assessment Coverage</span>

            <strong>
              {dashboard.totalProjects > 0
                ? Math.round(
                    (dashboard.assessedProjects /
                      dashboard.totalProjects) *
                      100
                  )
                : 0}
              %
            </strong>

            <small>
              Projects with stored risk scores
            </small>

          </div>


          <div className="coverage-card">

            <span>Review Rate</span>

            <strong>
              {dashboard.assessedProjects > 0
                ? (
                    (dashboard.requiresReview /
                      dashboard.assessedProjects) *
                    100
                  ).toFixed(1)
                : "0.0"}
              %
            </strong>

            <small>
              High or critical assessments
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <div className="dashboard-disclaimer">

        <span className="disclaimer-icon">
          i
        </span>

        <p>
          The system identifies unusual patterns and risk
          indicators for further examination. It does not
          establish fraud or misconduct.
        </p>

      </div>

    </div>
  );
}

export default Dashboard;