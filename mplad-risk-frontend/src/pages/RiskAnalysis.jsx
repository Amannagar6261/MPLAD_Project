import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./RiskAnalysis.css";

const API_BASE_URL = "http://localhost:8080";

function RiskAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [riskData, setRiskData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [mlData, setMlData] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/projects`
        );

        if (!response.ok) {
          throw new Error("Unable to load projects");
        }

        const data = await response.json();

        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load projects from the backend.");
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // =========================================================
  // READ PROJECT ID FROM URL
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get("projectId");

    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [location.search]);

  // =========================================================
  // SELECTED PROJECT
  // =========================================================

  const selectedProject = useMemo(() => {
    return projects.find(
      (project) =>
        String(project.id) === String(selectedProjectId)
    );
  }, [projects, selectedProjectId]);

  // =========================================================
  // SEARCH PROJECTS
  // =========================================================

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return projects.slice(0, 12);
    }

    return projects
      .filter((project) => {
        return (
          project.projectCode?.toLowerCase().includes(query) ||
          project.projectName?.toLowerCase().includes(query) ||
          project.projectType?.toLowerCase().includes(query) ||
          project.district?.toLowerCase().includes(query) ||
          project.state?.toLowerCase().includes(query)
        );
      })
      .slice(0, 12);
  }, [projects, searchTerm]);

  // =========================================================
  // LOAD RISK + COMPARISON + ML
  // =========================================================

  useEffect(() => {
    if (!selectedProjectId) {
      setRiskData(null);
      setComparisonData(null);
      setMlData(null);
      return;
    }

    const loadAssessment = async () => {
      try {
        setLoadingAssessment(true);
        setError("");

        const [
          riskResponse,
          comparisonResponse,
          mlResponse
        ] = await Promise.all([
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

        if (!riskResponse.ok) {
          throw new Error("Unable to load risk assessment");
        }

        if (!comparisonResponse.ok) {
          throw new Error("Unable to load comparison data");
        }

        if (!mlResponse.ok) {
          throw new Error("Unable to load ML analysis");
        }

        const [
          risk,
          comparison,
          ml
        ] = await Promise.all([
          riskResponse.json(),
          comparisonResponse.json(),
          mlResponse.json()
        ]);

        setRiskData(risk);
        setComparisonData(comparison);
        setMlData(ml);
      } catch (err) {
        console.error(err);

        setRiskData(null);
        setComparisonData(null);
        setMlData(null);

        setError(
          "Unable to load complete risk assessment for this project."
        );
      } finally {
        setLoadingAssessment(false);
      }
    };

    loadAssessment();
  }, [selectedProjectId]);

  // =========================================================
  // SELECT PROJECT
  // =========================================================

  const handleProjectSelect = (projectId) => {
    const id = String(projectId);

    setSelectedProjectId(id);
    setSearchTerm("");

    navigate(`/risk-analysis?projectId=${id}`, {
      replace: true
    });
  };

  // =========================================================
  // FORMAT HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    return `${Number(value).toFixed(1)}%`;
  };

  // =========================================================
  // UTILIZATION
  // =========================================================

  const utilization = useMemo(() => {
    if (
      !selectedProject ||
      selectedProject.sanctionedAmount === null ||
      selectedProject.sanctionedAmount === undefined ||
      Number(selectedProject.sanctionedAmount) === 0
    ) {
      return null;
    }

    return (
      (Number(selectedProject.expenditure || 0) /
        Number(selectedProject.sanctionedAmount)) *
      100
    );
  }, [selectedProject]);

  // =========================================================
  // SCORE BREAKDOWN
  // =========================================================

  const scoreBreakdown =
    riskData?.scoreBreakdown || {};

  const directScore =
    Number(scoreBreakdown.directFinancialTimeline || 0);

  const comparableScore =
    Number(scoreBreakdown.comparableProjects || 0);

  const mlScore =
    Number(scoreBreakdown.machineLearning || 0);

  const dataQualityScore =
    Number(scoreBreakdown.dataQuality || 0);

  const totalScore =
    Number(
      riskData?.score ??
        scoreBreakdown.total ??
        0
    );

  // =========================================================
  // REASONS
  // =========================================================

  const reasons = Array.isArray(riskData?.reasons)
    ? riskData.reasons
    : [];

  const hasIndicators = reasons.length > 0;

  // =========================================================
  // ML DATA
  // =========================================================

  const mlResult = mlData?.mlResult || mlData || {};

  const mlIsAnomaly =
    mlResult?.isAnomaly === true;

  const mlRiskScore =
    mlResult?.mlRiskScore ?? null;

  const anomalyScore =
    mlResult?.anomalyScore ?? null;

  // =========================================================
  // COMPARISON
  // =========================================================

  const comparison = comparisonData || {};

  // =========================================================
  // RISK CLASS
  // =========================================================

  const getRiskClass = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case "LOW":
        return "risk-low";

      case "MEDIUM":
        return "risk-medium";

      case "HIGH":
        return "risk-high";

      case "CRITICAL":
        return "risk-critical";

      default:
        return "risk-medium";
    }
  };

  // =========================================================
  // ESCAPE HTML
  // =========================================================

  const escapeHtml = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // =========================================================
  // PRINT COMPLETE REPORT
  //
  // IMPORTANT:
  // We temporarily replace the current document with a
  // standalone printable document.
  //
  // This prevents:
  // - React sidebar from printing
  // - fixed header from printing
  // - internal scrollbar from printing
  // - only one-page clipping
  //
  // After print dialog closes, the application reloads.
  // =========================================================

  const handlePrint = () => {
    if (!selectedProject || !riskData) {
      return;
    }

    const project = selectedProject;
    const riskLevel = riskData.riskLevel || "UNKNOWN";

    const projectUtilization =
      utilization !== null
        ? formatPercentage(utilization)
        : "—";

    const printableReasons = hasIndicators
      ? reasons
          .map(
            (reason, index) => `
              <div class="reason">
                <div class="reason-number">
                  ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="reason-content">
                  <div class="reason-title">
                    ${escapeHtml(reason)}
                  </div>

                  <div class="reason-subtitle">
                    Contributing measurable indicator
                  </div>
                </div>
              </div>
            `
          )
          .join("")
      : `
          <div class="no-indicators">
            <strong>
              No significant indicators identified
            </strong>

            <p>
              The available financial, timeline,
              comparison and machine-learning evidence
              did not produce significant contributing
              indicators.
            </p>
          </div>
        `;

    const printableDocument = `
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8">

          <title>
            MPLAD Risk Report -
            ${escapeHtml(project.projectCode)}
          </title>

          <style>

            @page {
              size: A4;
              margin: 14mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;

              width: 100%;
              height: auto;

              overflow: visible !important;

              background: #ffffff;
              color: #172033;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body {
              font-size: 11px;
              line-height: 1.5;
            }

            .report {
              width: 100%;
              height: auto;
              overflow: visible;
            }

            .report-header {
              display: flex;
              justify-content: space-between;
              align-items: center;

              padding-bottom: 14px;
              margin-bottom: 20px;

              border-bottom: 2px solid #172033;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .brand {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .brand-logo {
              width: 34px;
              height: 34px;

              border-radius: 8px;

              background: #172033;
              color: white;

              display: flex;
              align-items: center;
              justify-content: center;

              font-size: 17px;
              font-weight: 800;
            }

            .brand-title {
              font-size: 16px;
              font-weight: 800;
            }

            .brand-subtitle {
              font-size: 9px;
              color: #748097;
              margin-top: 1px;
            }

            .report-meta {
              text-align: right;
              color: #748097;
              font-size: 9px;
            }

            .report-meta strong {
              display: block;
              color: #344054;
              margin-bottom: 2px;
            }

            .report-title {
              margin-bottom: 18px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .eyebrow {
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 1.5px;
              color: #7a879c;
              text-transform: uppercase;
            }

            .report-title h1 {
              margin: 4px 0 3px;
              font-size: 25px;
              line-height: 1.15;
            }

            .report-title p {
              margin: 0;
              color: #748097;
              font-size: 10px;
            }

            .project-summary {
              border: 1px solid #dce2ea;
              border-radius: 10px;

              padding: 15px;
              margin-bottom: 15px;

              background: #f7f9fb;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .project-code {
              font-size: 9px;
              font-weight: 800;
              color: #657289;
              letter-spacing: 0.8px;
            }

            .project-name {
              font-size: 19px;
              font-weight: 800;
              margin: 3px 0 7px;
            }

            .project-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 14px;

              color: #647187;
              font-size: 9px;
            }

            .score-box {
              display: grid;
              grid-template-columns: 190px 1fr;

              border: 1px solid #dce2ea;
              border-radius: 10px;

              overflow: hidden;

              margin-bottom: 15px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .score-main {
              padding: 17px;
              border-right: 1px solid #e2e6ec;
            }

            .score-number {
              font-size: 43px;
              font-weight: 800;
              line-height: 1;
            }

            .score-number span {
              font-size: 14px;
              color: #8a95a7;
              margin-left: 3px;
            }

            .score-label {
              margin-top: 7px;

              font-size: 8px;
              font-weight: 800;

              letter-spacing: 1.1px;

              color: #8994a7;
            }

            .score-status {
              padding: 17px;
            }

            .risk-badge {
              display: inline-block;

              padding: 4px 9px;

              border-radius: 20px;

              font-size: 8px;
              font-weight: 800;

              letter-spacing: 0.7px;

              margin-bottom: 5px;
            }

            .risk-low {
              background: #edf8f1;
              color: #247245;
            }

            .risk-medium {
              background: #fff7df;
              color: #986b00;
            }

            .risk-high {
              background: #fff0e8;
              color: #b65327;
            }

            .risk-critical {
              background: #fff0f0;
              color: #b33131;
            }

            .score-status h2 {
              margin: 0;
              font-size: 16px;
            }

            .score-status p {
              margin: 4px 0 0;
              color: #748097;
              font-size: 9px;
            }

            .section {
              margin-bottom: 17px;

              page-break-inside: auto;
            }

            .section-title {
              border-bottom: 1px solid #dce2ea;

              padding-bottom: 7px;
              margin-bottom: 10px;
            }

            .section-title h2 {
              margin: 0;
              font-size: 15px;
            }

            .section-title p {
              margin: 2px 0 0;
              font-size: 9px;
              color: #7a879a;
            }

            .composition {
              display: grid;

              grid-template-columns:
                repeat(4, 1fr);

              gap: 8px;
            }

            .composition-item {
              border: 1px solid #e2e6ec;
              border-radius: 8px;

              padding: 11px;

              background: #fafbfc;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .composition-score {
              font-size: 20px;
              font-weight: 800;
            }

            .composition-label {
              margin-top: 4px;
              font-size: 8px;
              color: #778399;
            }

            .evidence-grid {
              display: grid;

              grid-template-columns:
                1fr 1fr;

              gap: 9px;
            }

            .evidence-card {
              border: 1px solid #e2e6ec;
              border-radius: 8px;

              padding: 13px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .evidence-title {
              font-size: 12px;
              font-weight: 800;
            }

            .evidence-subtitle {
              margin-top: 2px;

              font-size: 8px;
              color: #8792a4;
            }

            .evidence-score {
              margin-top: 9px;

              font-size: 24px;
              font-weight: 800;
            }

            .evidence-score span {
              font-size: 10px;
              color: #8994a7;
            }

            .evidence-description {
              margin: 6px 0 10px;

              font-size: 9px;
              color: #778399;
            }

            .metrics {
              display: grid;

              grid-template-columns:
                1fr 1fr;

              gap: 8px;

              border-top: 1px solid #edf0f4;

              padding-top: 9px;
            }

            .metric-label {
              font-size: 7px;
              color: #909bad;
              margin-bottom: 2px;
            }

            .metric-value {
              font-size: 9px;
              font-weight: 700;
              color: #2d3a4e;

              overflow-wrap: anywhere;
            }

            .ml-status {
              padding: 7px 9px;

              border-radius: 6px;

              margin: 8px 0;

              font-size: 8px;
              font-weight: 750;
            }

            .ml-normal {
              background: #f0f8f3;
              color: #287248;
            }

            .ml-anomaly {
              background: #fff2eb;
              color: #ae4d26;
            }

            .reason {
              display: flex;

              gap: 10px;
              align-items: flex-start;

              border: 1px solid #e2e6ec;
              border-radius: 8px;

              padding: 10px;
              margin-bottom: 7px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .reason-number {
              width: 27px;
              height: 27px;

              flex-shrink: 0;

              border-radius: 6px;

              background: #eef1f5;

              display: flex;
              align-items: center;
              justify-content: center;

              color: #69778c;

              font-size: 8px;
              font-weight: 800;
            }

            .reason-title {
              font-size: 9px;
              font-weight: 700;

              line-height: 1.45;
            }

            .reason-subtitle {
              margin-top: 2px;

              font-size: 7px;
              color: #909bad;
            }

            .no-indicators {
              border: 1px solid #dcebe2;

              background: #f7fbf8;

              border-radius: 8px;

              padding: 12px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .no-indicators strong {
              color: #2c6545;
              font-size: 9px;
            }

            .no-indicators p {
              margin: 3px 0 0;

              color: #718379;
              font-size: 8px;
            }

            .next-step {
              border: 1px solid #dce2ea;

              background: #f5f7fa;

              border-radius: 8px;

              padding: 13px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .next-step h2 {
              margin: 2px 0 4px;
              font-size: 13px;
            }

            .next-step p {
              margin: 0;

              font-size: 8px;
              color: #778399;
            }

            .disclaimer {
              border-top: 1px solid #dce2ea;

              margin-top: 17px;
              padding-top: 9px;

              color: #7d889a;

              font-size: 7.5px;

              line-height: 1.45;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            .report-footer {
              margin-top: 12px;

              padding-top: 7px;

              border-top: 1px solid #edf0f4;

              display: flex;
              justify-content: space-between;

              color: #9aa3b2;

              font-size: 7px;

              page-break-inside: avoid;
              break-inside: avoid;
            }

            @media print {

              html,
              body {
                height: auto !important;
                overflow: visible !important;
              }

              .report {
                height: auto !important;
                overflow: visible !important;
              }

              .section,
              .evidence-grid,
              .composition {
                overflow: visible !important;
              }

            }

          </style>

        </head>

        <body>

          <div class="report">

            <!-- HEADER -->

            <div class="report-header">

              <div class="brand">

                <div class="brand-logo">
                  M
                </div>

                <div>

                  <div class="brand-title">
                    MPLAD Project Intelligence
                  </div>

                  <div class="brand-subtitle">
                    AI-Assisted Project Monitoring & Anomaly Detection
                  </div>

                </div>

              </div>

              <div class="report-meta">

                <strong>
                  PROJECT RISK REPORT
                </strong>

                Generated from current assessment data

              </div>

            </div>


            <!-- TITLE -->

            <div class="report-title">

              <div class="eyebrow">
                PROJECT INTELLIGENCE
              </div>

              <h1>
                Risk Analysis Report
              </h1>

              <p>
                Explainable financial, comparative and
                machine-learning assessment.
              </p>

            </div>


            <!-- PROJECT -->

            <div class="project-summary">

              <div class="project-code">
                ${escapeHtml(project.projectCode)}
              </div>

              <div class="project-name">
                ${escapeHtml(project.projectName)}
              </div>

              <div class="project-meta">

                <span>
                  Type:
                  ${escapeHtml(project.projectType || "—")}
                </span>

                <span>
                  District:
                  ${escapeHtml(project.district || "—")}
                </span>

                <span>
                  State:
                  ${escapeHtml(project.state || "—")}
                </span>

                <span>
                  Status:
                  ${escapeHtml(project.status || "—")}
                </span>

              </div>

            </div>


            <!-- SCORE -->

            <div class="score-box">

              <div class="score-main">

                <div class="score-number">
                  ${totalScore}
                  <span>/100</span>
                </div>

                <div class="score-label">
                  OVERALL RISK SCORE
                </div>

              </div>

              <div class="score-status">

                <div class="risk-badge ${getRiskClass(
                  riskLevel
                )}">
                  ${escapeHtml(riskLevel)}
                </div>

                <h2>
                  ${escapeHtml(riskLevel)} Risk
                </h2>

                <p>
                  The score combines direct financial and
                  timeline evidence, comparable-project
                  evidence, machine-learning signals and
                  data-quality indicators.
                </p>

              </div>

            </div>


            <!-- SCORE COMPOSITION -->

            <div class="section">

              <div class="section-title">

                <div class="eyebrow">
                  RISK COMPOSITION
                </div>

                <h2>
                  How the score was formed
                </h2>

                <p>
                  Maximum contribution = 100 points
                </p>

              </div>

              <div class="composition">

                <div class="composition-item">

                  <div class="composition-score">
                    ${directScore}/35
                  </div>

                  <div class="composition-label">
                    Direct Financial & Timeline
                  </div>

                </div>

                <div class="composition-item">

                  <div class="composition-score">
                    ${comparableScore}/35
                  </div>

                  <div class="composition-label">
                    Comparable Projects
                  </div>

                </div>

                <div class="composition-item">

                  <div class="composition-score">
                    ${mlScore}/25
                  </div>

                  <div class="composition-label">
                    Machine Learning
                  </div>

                </div>

                <div class="composition-item">

                  <div class="composition-score">
                    ${dataQualityScore}/5
                  </div>

                  <div class="composition-label">
                    Data Quality
                  </div>

                </div>

              </div>

            </div>


            <!-- EVIDENCE -->

            <div class="section">

              <div class="section-title">

                <div class="eyebrow">
                  EXPLAINABLE EVIDENCE
                </div>

                <h2>
                  Evidence contributing to the assessment
                </h2>

              </div>


              <div class="evidence-grid">

                <!-- DIRECT -->

                <div class="evidence-card">

                  <div class="evidence-title">
                    Direct Financial & Timeline
                  </div>

                  <div class="evidence-subtitle">
                    Project-level measurable indicators
                  </div>

                  <div class="evidence-score">
                    ${directScore}
                    <span>/35</span>
                  </div>

                  <div class="evidence-description">
                    Evaluates measurable financial utilization
                    and project timeline indicators.
                  </div>

                  <div class="metrics">

                    <div>
                      <div class="metric-label">
                        SANCTIONED
                      </div>

                      <div class="metric-value">
                        ${formatCurrency(
                          project.sanctionedAmount
                        )}
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        EXPENDITURE
                      </div>

                      <div class="metric-value">
                        ${formatCurrency(
                          project.expenditure
                        )}
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        UTILIZATION
                      </div>

                      <div class="metric-value">
                        ${projectUtilization}
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        STATUS
                      </div>

                      <div class="metric-value">
                        ${escapeHtml(
                          project.status || "—"
                        )}
                      </div>
                    </div>

                  </div>

                </div>


                <!-- COMPARISON -->

                <div class="evidence-card">

                  <div class="evidence-title">
                    Comparable Projects
                  </div>

                  <div class="evidence-subtitle">
                    Contextual statistical comparison
                  </div>

                  <div class="evidence-score">
                    ${comparableScore}
                    <span>/35</span>
                  </div>

                  <div class="evidence-description">
                    Analysis uses
                    ${comparison.comparableProjectCount ?? 0}
                    comparable projects selected using
                    project type, scale, location and project
                    year.
                  </div>

                  <div class="metrics">

                    <div>
                      <div class="metric-label">
                        SELECTION LEVEL
                      </div>

                      <div class="metric-value">
                        ${escapeHtml(
                          comparison.peerSelectionLevel || "—"
                        )}
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        PEER COUNT
                      </div>

                      <div class="metric-value">
                        ${
                          comparison.comparableProjectCount ??
                          "—"
                        }
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        COST PERCENTILE
                      </div>

                      <div class="metric-value">
                        ${
                          comparison.costPercentilePosition !==
                            null &&
                          comparison.costPercentilePosition !==
                            undefined
                            ? `${formatNumber(
                                comparison.costPercentilePosition
                              )}th`
                            : "—"
                        }
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        DURATION PERCENTILE
                      </div>

                      <div class="metric-value">
                        ${
                          comparison.durationPercentilePosition !==
                            null &&
                          comparison.durationPercentilePosition !==
                            undefined
                            ? `${formatNumber(
                                comparison.durationPercentilePosition
                              )}th`
                            : "—"
                        }
                      </div>
                    </div>

                  </div>

                </div>


                <!-- ML -->

                <div class="evidence-card">

                  <div class="evidence-title">
                    Machine Learning
                  </div>

                  <div class="evidence-subtitle">
                    Isolation Forest anomaly signal
                  </div>

                  <div class="evidence-score">
                    ${mlScore}
                    <span>/25</span>
                  </div>

                  <div class="evidence-description">
                    The ML model analysed 5 measurable
                    features using the 650-project training
                    dataset.
                  </div>

                  <div class="ml-status ${
                    mlIsAnomaly
                      ? "ml-anomaly"
                      : "ml-normal"
                  }">

                    ${
                      mlIsAnomaly
                        ? "Anomaly pattern detected"
                        : "No anomaly signal detected"
                    }

                  </div>

                  <div class="metrics">

                    <div>
                      <div class="metric-label">
                        ML RISK
                      </div>

                      <div class="metric-value">
                        ${
                          mlRiskScore !== null &&
                          mlRiskScore !== undefined
                            ? `${mlRiskScore}/100`
                            : "—"
                        }
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        ANOMALY SCORE
                      </div>

                      <div class="metric-value">
                        ${
                          anomalyScore !== null &&
                          anomalyScore !== undefined
                            ? Number(
                                anomalyScore
                              ).toFixed(4)
                            : "—"
                        }
                      </div>
                    </div>

                    <div>
                      <div class="metric-label">
                        MODEL
                      </div>

                      <div class="metric-value">
                        ${escapeHtml(
                          mlResult.model ||
                          "Isolation Forest"
                        )}
                      </div>
                    </div>

                  </div>

                </div>


                <!-- DATA QUALITY -->

                <div class="evidence-card">

                  <div class="evidence-title">
                    Data Quality
                  </div>

                  <div class="evidence-subtitle">
                    Completeness and consistency
                  </div>

                  <div class="evidence-score">
                    ${dataQualityScore}
                    <span>/5</span>
                  </div>

                  <div class="evidence-description">
                    Represents the contribution from
                    data-quality indicators available for
                    the assessment.
                  </div>

                </div>

              </div>

            </div>


            <!-- INDICATORS -->

            <div class="section">

              <div class="section-title">

                <div class="eyebrow">
                  EXPLANATION
                </div>

                <h2>
                  Contributing Indicators
                </h2>

                <p>
                  ${
                    hasIndicators
                      ? `${reasons.length} measurable ${
                          reasons.length === 1
                            ? "indicator"
                            : "indicators"
                        } contributed to the assessment.`
                      : "No significant indicators were identified from the available evidence."
                  }
                </p>

              </div>

              ${printableReasons}

            </div>


            <!-- NEXT STEP -->

            <div class="next-step">

              <div class="eyebrow">
                NEXT STEP
              </div>

              <h2>
                Further examination may be appropriate
              </h2>

              <p>
                Use the evidence above to understand which
                measurable indicators contributed to the
                project's risk score before deciding whether
                additional review is required.
              </p>

            </div>


            <!-- DISCLAIMER -->

            <div class="disclaimer">

              <strong>
                Assessment Disclaimer:
              </strong>

              The system identifies unusual patterns and risk
              indicators for further examination. It does not
              establish fraud or misconduct. Statistical
              comparisons are analytical indicators and are
              not official MPLADS cost benchmarks.

            </div>


            <!-- FOOTER -->

            <div class="report-footer">

              <span>
                MPLAD Project Intelligence
              </span>

              <span>
                Project:
                ${escapeHtml(project.projectCode)}
              </span>

            </div>

          </div>

        </body>

      </html>
    `;

    // =======================================================
    // IMPORTANT:
    // DO NOT OPEN A NEW WINDOW.
    //
    // Replace the current document temporarily.
    // This guarantees Chrome sees only the report.
    // =======================================================

    document.open();

    document.write(printableDocument);

    document.close();

    // Give Chrome enough time to fully lay out
    // every page before opening print preview.

    setTimeout(() => {
      window.focus();
      window.print();

      // When print preview is closed,
      // restore the complete React application.

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 1000);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const openComparison = () => {
    if (!selectedProjectId) {
      return;
    }

    navigate(
      `/comparison?projectId=${selectedProjectId}`
    );
  };

  const openProject = () => {
    if (!selectedProjectId) {
      return;
    }

    navigate(`/projects/${selectedProjectId}`);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="risk-analysis-page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <div className="page-eyebrow">
            PROJECT INTELLIGENCE
          </div>

          <h1>
            Risk Analysis
          </h1>

          <p>
            Review explainable financial, comparative and
            machine-learning evidence for a project.
          </p>

        </div>

        <div className="page-header-actions">

          <button
            className="secondary-button"
            onClick={() => navigate("/projects")}
          >
            ← Projects
          </button>

          {riskData && selectedProject && (
            <button
              className="secondary-button print-button"
              onClick={handlePrint}
            >
              ⎙ Print Report
            </button>
          )}

        </div>

      </div>


      {/* PROJECT SELECTOR */}

      <section className="risk-project-selector">

        <div className="selector-heading">

          <div>

            <span className="section-label">
              SELECT PROJECT
            </span>

            <h2>
              Choose a project to assess its risk profile
            </h2>

            <p>
              Search by project code, name, type, district or
              state.
            </p>

          </div>

        </div>

        <div className="project-search-wrapper">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            value={searchTerm}
            placeholder="Search projects..."
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        {searchTerm &&
          filteredProjects.length > 0 && (

            <div className="project-search-results">

              {filteredProjects.map((project) => (

                <button
                  key={project.id}
                  type="button"
                  className="project-search-result"
                  onClick={() =>
                    handleProjectSelect(project.id)
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
                    {project.projectType} •{" "}
                    {project.district},{" "}
                    {project.state}
                  </small>

                </button>

              ))}

            </div>

          )}

      </section>


      {/* LOADING */}

      {loadingProjects && (
        <div className="risk-empty-state">
          Loading projects...
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="risk-error">
          {error}
        </div>
      )}


      {/* NO PROJECT */}

      {!loadingProjects &&
        !loadingAssessment &&
        !selectedProjectId && (

          <div className="risk-empty-state">

            <div className="empty-icon">
              ◈
            </div>

            <h2>
              Select a project to begin
            </h2>

            <p>
              Choose a project above to view its financial,
              comparative and machine-learning assessment.
            </p>

          </div>

        )}


      {/* LOADING ASSESSMENT */}

      {loadingAssessment && (

        <div className="risk-loading-card">

          <div className="loading-spinner"></div>

          <div>

            <strong>
              Preparing risk assessment
            </strong>

            <span>
              Analysing project evidence...
            </span>

          </div>

        </div>

      )}


      {/* MAIN ASSESSMENT */}

      {!loadingAssessment &&
        riskData &&
        selectedProject && (

          <>

            {/* PROJECT HERO */}

            <section className="risk-project-hero">

              <div className="risk-project-hero-left">

                <div className="hero-project-label">
                  SELECTED PROJECT
                </div>

                <div className="hero-project-code">
                  {selectedProject.projectCode}
                </div>

                <h2>
                  {selectedProject.projectName}
                </h2>

                <div className="hero-project-meta">

                  <span>
                    ✓ PROJECT
                  </span>

                  <span>
                    {selectedProject.projectType}
                  </span>

                  <span>
                    {selectedProject.district},{" "}
                    {selectedProject.state}
                  </span>

                </div>

              </div>

              <button
                className="hero-project-button"
                onClick={openProject}
              >
                View Project →
              </button>

            </section>


            {/* SCORE OVERVIEW */}

            <section className="risk-score-section">

              <div className="risk-score-main">

                <div className="score-number">

                  {totalScore}

                  <span>
                    /100
                  </span>

                </div>

                <div className="score-label">
                  OVERALL RISK SCORE
                </div>

              </div>


              <div className="risk-score-status">

                <div
                  className={`risk-status-badge ${getRiskClass(
                    riskData.riskLevel
                  )}`}
                >
                  {riskData.riskLevel}
                </div>

                <h2>
                  {riskData.riskLevel} Risk
                </h2>

                <p>
                  The score combines direct financial and
                  timeline evidence, comparable-project
                  evidence, machine-learning signals and
                  data-quality indicators.
                </p>

              </div>

            </section>


            {/* SCORE COMPOSITION */}

            <section className="risk-section">

              <div className="section-topline">

                <div>

                  <span className="section-label">
                    RISK COMPOSITION
                  </span>

                  <h2>
                    How the score was formed
                  </h2>

                  <p>
                    Maximum contribution = 100 points
                  </p>

                </div>

              </div>


              <div className="score-composition-grid">

                <div className="score-component">

                  <strong>
                    {directScore}/35
                  </strong>

                  <span>
                    Direct Financial & Timeline
                  </span>

                </div>


                <div className="score-component">

                  <strong>
                    {comparableScore}/35
                  </strong>

                  <span>
                    Comparable Projects
                  </span>

                </div>


                <div className="score-component">

                  <strong>
                    {mlScore}/25
                  </strong>

                  <span>
                    Machine Learning
                  </span>

                </div>


                <div className="score-component">

                  <strong>
                    {dataQualityScore}/5
                  </strong>

                  <span>
                    Data Quality
                  </span>

                </div>

              </div>

            </section>


            {/* EXPLAINABLE EVIDENCE */}

            <section className="risk-section">

              <div className="section-topline">

                <div>

                  <span className="section-label">
                    EXPLAINABLE EVIDENCE
                  </span>

                  <h2>
                    Why this project received this score
                  </h2>

                </div>

              </div>


              <div className="evidence-grid">

                {/* DIRECT */}

                <div className="evidence-card">

                  <div className="evidence-card-header">

                    <div className="evidence-icon">
                      ₹
                    </div>

                    <div>

                      <h3>
                        Direct Financial & Timeline
                      </h3>

                      <span>
                        Project-level measurable indicators
                      </span>

                    </div>

                  </div>


                  <div className="evidence-score">

                    <strong>
                      {directScore}
                    </strong>

                    <span>
                      / 35
                    </span>

                  </div>


                  <p className="evidence-description">
                    Evaluates measurable financial utilization
                    and project timeline indicators.
                  </p>


                  <div className="evidence-metrics">

                    <div>
                      <span>
                        Sanctioned
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedProject.sanctionedAmount
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Expenditure
                      </span>

                      <strong>
                        {formatCurrency(
                          selectedProject.expenditure
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Utilization
                      </span>

                      <strong>
                        {utilization !== null
                          ? formatPercentage(utilization)
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {selectedProject.status || "—"}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* COMPARABLE */}

                <div className="evidence-card">

                  <div className="evidence-card-header">

                    <div className="evidence-icon">
                      ⇄
                    </div>

                    <div>

                      <h3>
                        Comparable Projects
                      </h3>

                      <span>
                        Contextual statistical comparison
                      </span>

                    </div>

                  </div>


                  <div className="evidence-score">

                    <strong>
                      {comparableScore}
                    </strong>

                    <span>
                      / 35
                    </span>

                  </div>


                  <p className="evidence-description">

                    The analysis uses{" "}

                    <strong>
                      {comparison?.comparableProjectCount ?? 0}
                    </strong>{" "}

                    comparable projects selected using project
                    type, scale, location and project year.

                  </p>


                  <div className="evidence-metrics">

                    <div>
                      <span>
                        Selection level
                      </span>

                      <strong>
                        {comparison?.peerSelectionLevel ||
                          "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Peer count
                      </span>

                      <strong>
                        {comparison?.comparableProjectCount ??
                          "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Cost percentile
                      </span>

                      <strong>
                        {comparison?.costPercentilePosition !==
                          null &&
                        comparison?.costPercentilePosition !==
                          undefined
                          ? `${formatNumber(
                              comparison.costPercentilePosition
                            )}th`
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Duration percentile
                      </span>

                      <strong>
                        {comparison?.durationPercentilePosition !==
                          null &&
                        comparison?.durationPercentilePosition !==
                          undefined
                          ? `${formatNumber(
                              comparison.durationPercentilePosition
                            )}th`
                          : "—"}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* ML */}

                <div className="evidence-card">

                  <div className="evidence-card-header">

                    <div className="evidence-icon">
                      ✦
                    </div>

                    <div>

                      <h3>
                        Machine Learning
                      </h3>

                      <span>
                        Isolation Forest anomaly signal
                      </span>

                    </div>

                  </div>


                  <div className="evidence-score">

                    <strong>
                      {mlScore}
                    </strong>

                    <span>
                      / 25
                    </span>

                  </div>


                  <p className="evidence-description">

                    The ML model analysed{" "}

                    <strong>
                      5 measurable features
                    </strong>{" "}

                    using the 650-project training dataset.

                  </p>


                  <div
                    className={`ml-status ${
                      mlIsAnomaly
                        ? "ml-anomaly"
                        : "ml-normal"
                    }`}
                  >

                    <span className="ml-status-icon">
                      {mlIsAnomaly ? "!" : "✓"}
                    </span>

                    <span>

                      {mlIsAnomaly
                        ? "Anomaly pattern detected"
                        : "No anomaly signal detected"}

                    </span>

                  </div>


                  <div className="evidence-metrics">

                    <div>
                      <span>
                        ML Risk
                      </span>

                      <strong>
                        {mlRiskScore !== null &&
                        mlRiskScore !== undefined
                          ? `${mlRiskScore}/100`
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Anomaly Score
                      </span>

                      <strong>
                        {anomalyScore !== null &&
                        anomalyScore !== undefined
                          ? Number(
                              anomalyScore
                            ).toFixed(4)
                          : "—"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Model
                      </span>

                      <strong>
                        {mlResult?.model ||
                          "Isolation Forest"}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* DATA QUALITY */}

                <div className="evidence-card">

                  <div className="evidence-card-header">

                    <div className="evidence-icon">
                      ✓
                    </div>

                    <div>

                      <h3>
                        Data Quality
                      </h3>

                      <span>
                        Completeness and consistency
                      </span>

                    </div>

                  </div>


                  <div className="evidence-score">

                    <strong>
                      {dataQualityScore}
                    </strong>

                    <span>
                      / 5
                    </span>

                  </div>


                  <p className="evidence-description">
                    Represents the contribution from
                    data-quality indicators available for the
                    assessment.
                  </p>

                </div>

              </div>

            </section>


            {/* CONTRIBUTING INDICATORS */}

            <section className="risk-section">

              <div className="section-topline">

                <div>

                  <span className="section-label">
                    EXPLANATION
                  </span>

                  <h2>
                    Contributing Indicators
                  </h2>

                  <p>

                    {hasIndicators
                      ? `${reasons.length} measurable ${
                          reasons.length === 1
                            ? "indicator"
                            : "indicators"
                        } contributed to the assessment.`
                      : "No significant indicators were identified from the available evidence."}

                  </p>

                </div>

              </div>


              {hasIndicators ? (

                <div className="risk-reasons">

                  {reasons.map((reason, index) => (

                    <div
                      className="risk-reason"
                      key={`${reason}-${index}`}
                    >

                      <div className="reason-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="reason-content">

                        <strong>
                          {reason}
                        </strong>

                        <span>
                          Contributing measurable indicator
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="no-indicators-card">

                  <div className="no-indicators-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      No significant indicators identified
                    </strong>

                    <p>
                      The available financial, timeline,
                      comparison and machine-learning evidence
                      did not produce significant contributing
                      indicators.
                    </p>

                  </div>

                </div>

              )}

            </section>


            {/* NEXT STEP */}

            <section className="risk-next-step">

              <div className="next-step-icon">
                ◈
              </div>

              <div className="next-step-content">

                <span className="section-label">
                  NEXT STEP
                </span>

                <h2>
                  Further examination may be appropriate
                </h2>

                <p>
                  Use the evidence above to understand which
                  measurable indicators contributed to the
                  project's risk score before deciding whether
                  additional review is required.
                </p>

              </div>

              <button
                className="primary-button"
                onClick={openComparison}
              >
                View Comparison →
              </button>

            </section>


            {/* DISCLAIMER */}

            <div className="risk-disclaimer">

              <span>
                i
              </span>

              <p>
                The system identifies unusual patterns and risk
                indicators for further examination. It does not
                establish fraud or misconduct. Statistical
                comparisons are analytical indicators and are
                not official MPLADS cost benchmarks.
              </p>

            </div>

          </>

        )}

    </div>
  );
}

export default RiskAnalysis;