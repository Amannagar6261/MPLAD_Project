import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./ProjectDetails.css";

const API_BASE_URL = "http://localhost:8080";

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function calculateDuration(startDate, completionDate) {
  if (!startDate || !completionDate) {
    return null;
  }

  const start = new Date(startDate);
  const completion = new Date(completionDate);

  const difference =
    completion.getTime() - start.getTime();

  if (difference < 0) {
    return null;
  }

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function formatNumber(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value);
}

function getStatusClass(status) {
  const normalized =
    String(status || "unknown")
      .trim()
      .toLowerCase();

  if (normalized === "completed") {
    return "completed";
  }

  if (normalized === "ongoing") {
    return "ongoing";
  }

  if (normalized === "delayed") {
    return "delayed";
  }

  return "unknown";
}

function getUtilization(sanctioned, expenditure) {
  if (
    !sanctioned ||
    sanctioned <= 0 ||
    expenditure === null ||
    expenditure === undefined
  ) {
    return null;
  }

  return (expenditure / sanctioned) * 100;
}

function DetailItem({ label, value }) {
  return (
    <div className="project-detail-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function TechnicalItem({ label, value }) {
  return (
    <div className="technical-item">
      <span>{label}</span>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/projects/${id}`
        );

        if (!response.ok) {
          throw new Error(
            `Project API returned ${response.status}`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            "Unable to load this project. Please check the project ID and backend connection."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const utilization = useMemo(() => {
    if (!project) {
      return null;
    }

    return getUtilization(
      project.sanctionedAmount,
      project.expenditure
    );
  }, [project]);

  const duration = useMemo(() => {
    if (!project) {
      return null;
    }

    return calculateDuration(
      project.startDate,
      project.completionDate
    );
  }, [project]);

  const technicalData = useMemo(() => {
    if (!project) {
      return [];
    }

    const type = String(
      project.projectType || ""
    ).toLowerCase();

    if (
      type.includes("education") &&
      project.schoolProjectDetails
    ) {
      const d = project.schoolProjectDetails;

      return [
        ["Built-up area", d.builtUpArea
          ? `${formatNumber(d.builtUpArea)} sq.ft`
          : "—"],
        ["Classrooms", d.classroomCount],
        ["Laboratories", d.labCount],
        ["Library", d.libraryAvailable ? "Available" : "Not available"],
        ["Toilets", d.toiletCount],
        ["Drinking water", d.drinkingWaterAvailable ? "Available" : "Not available"],
        ["Boundary wall", d.boundaryWall ? "Available" : "Not available"]
      ];
    }

    if (
      type.includes("road") &&
      project.roadProjectDetails
    ) {
      const d = project.roadProjectDetails;

      return [
        ["Road length", d.roadLengthKm
          ? `${formatNumber(d.roadLengthKm)} km`
          : "—"],
        ["Road width", d.roadWidth
          ? `${formatNumber(d.roadWidth)} m`
          : "—"],
        ["Road type", d.roadType],
        ["Shoulder work", d.shoulderWork ? "Yes" : "No"],
        ["Drainage work", d.drainageWork ? "Yes" : "No"],
        ["Culverts", d.culvertCount]
      ];
    }

    if (
      type.includes("water") &&
      project.waterSupplyProjectDetails
    ) {
      const d = project.waterSupplyProjectDetails;

      return [
        ["Capacity", d.capacity
          ? `${formatNumber(d.capacity)} ${d.capacityUnit || ""}`
          : "—"],
        ["Beneficiaries", formatNumber(d.beneficiaryCount)],
        ["Pipeline length", d.pipelineLengthKm
          ? `${formatNumber(d.pipelineLengthKm)} km`
          : "—"],
        ["Water source", d.waterSource],
        ["Supply type", d.supplyType],
        ["Storage tank", d.storageTank ? "Yes" : "No"],
        ["Treatment facility", d.treatmentFacility ? "Yes" : "No"]
      ];
    }

    if (
      type.includes("bridge") &&
      project.bridgeProjectDetails
    ) {
      const d = project.bridgeProjectDetails;

      return [
        ["Bridge length", d.bridgeLengthMeter
          ? `${formatNumber(d.bridgeLengthMeter)} m`
          : "—"],
        ["Bridge width", d.bridgeWidthMeter
          ? `${formatNumber(d.bridgeWidthMeter)} m`
          : "—"],
        ["Bridge type", d.bridgeType],
        ["Material", d.constructionMaterial],
        ["Span count", d.spanCount],
        ["Approach road", d.approachRoad ? "Yes" : "No"],
        ["Drainage work", d.drainageWork ? "Yes" : "No"]
      ];
    }

    if (
      type.includes("health") &&
      project.healthDetails
    ) {
      const d = project.healthDetails;

      return [
        ["Facility type", d.facilityType],
        ["Beds", d.bedCount],
        ["Built-up area", d.builtUpArea
          ? `${formatNumber(d.builtUpArea)} sq.ft`
          : "—"],
        ["Rooms", d.roomCount],
        ["Equipment", d.equipmentCount],
        ["Beneficiaries", formatNumber(d.beneficiaryCount)],
        ["Electricity", d.electricityAvailable ? "Available" : "Not available"],
        ["Drinking water", d.drinkingWaterAvailable ? "Available" : "Not available"],
        ["Sanitation", d.sanitationAvailable ? "Available" : "Not available"]
      ];
    }

    if (
      type.includes("irrigation") &&
      project.irrigationDetails
    ) {
      const d = project.irrigationDetails;

      return [
        ["Irrigation type", d.irrigationType],
        ["Irrigated area", d.irrigatedArea
          ? `${formatNumber(d.irrigatedArea)} ${d.areaUnit || ""}`
          : "—"],
        ["Canal length", d.canalLengthKm
          ? `${formatNumber(d.canalLengthKm)} km`
          : "—"],
        ["Pipeline length", d.pipelineLengthKm
          ? `${formatNumber(d.pipelineLengthKm)} km`
          : "—"],
        ["Beneficiaries", formatNumber(d.beneficiaryCount)],
        ["Water source", d.waterSource],
        ["Pump installed", d.pumpInstalled ? "Yes" : "No"],
        ["Drainage work", d.drainageWork ? "Yes" : "No"]
      ];
    }

    if (
      type.includes("electricity") &&
      project.electricityDetails
    ) {
      const d = project.electricityDetails;

      return [
        ["Work type", d.electricityWorkType],
        ["Line length", d.lineLengthKm
          ? `${formatNumber(d.lineLengthKm)} km`
          : "—"],
        ["Pole count", d.poleCount],
        ["Transformers", d.transformerCount],
        ["Transformer capacity", d.transformerCapacityKva
          ? `${formatNumber(d.transformerCapacityKva)} kVA`
          : "—"],
        ["Beneficiaries", formatNumber(d.beneficiaryCount)],
        ["Street lighting", d.streetLighting ? "Yes" : "No"],
        ["Solar component", d.solarComponent ? "Yes" : "No"]
      ];
    }

    if (project.genericProjectDetails) {
      const d = project.genericProjectDetails;

      return [
        ["Beneficiaries", formatNumber(d.beneficiaryCount)],
        ["Built-up area", d.builtUpArea
          ? `${formatNumber(d.builtUpArea)} sq.ft`
          : "—"],
        ["Quantity", d.quantity
          ? `${formatNumber(d.quantity)} ${d.quantityUnit || ""}`
          : "—"]
      ];
    }

    return [];
  }, [project]);

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="project-details-loading">
          <div className="details-spinner"></div>

          <h2>Loading project intelligence</h2>

          <p>
            Retrieving project information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-details-page">
        <div className="project-details-error">

          <div className="details-error-icon">
            !
          </div>

          <h2>Project unavailable</h2>

          <p>
            {error || "The requested project could not be found."}
          </p>

          <button
            className="details-secondary-button"
            onClick={() => navigate("/projects")}
          >
            ← Back to Projects
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">

      {/* =====================================================
          BACK
      ====================================================== */}

      <button
        className="details-back-button"
        onClick={() => navigate("/projects")}
      >
        ← Back to Projects
      </button>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="project-overview-hero">

        <div className="project-overview-main">

          <div className="project-overview-eyebrow">
            PROJECT OVERVIEW
          </div>

          <div className="project-title-row">

            <div>
              <h1>
                {project.projectName}
              </h1>

              <div className="project-code">
                {project.projectCode}
              </div>
            </div>

            <span
              className={`project-overview-status ${getStatusClass(
                project.status
              )}`}
            >
              {project.status || "Unknown"}
            </span>

          </div>

          <p className="project-location">
            {project.projectType || "Project"} ·{" "}
            {project.district || "District unavailable"},{" "}
            {project.state || "State unavailable"}
          </p>

        </div>

        <button
          className="risk-assessment-cta"
          onClick={() =>
            navigate(
              `/risk-analysis?projectId=${project.id}`
            )
          }
        >
          <span>
            <small>PROJECT INTELLIGENCE</small>
            Open Risk Assessment
          </span>

          <strong>→</strong>
        </button>

      </section>


      {/* =====================================================
          KPI STRIP
      ====================================================== */}

      <section className="project-kpi-grid">

        <div className="project-kpi-card">

          <span>Sanctioned Amount</span>

          <strong>
            {formatCurrency(
              project.sanctionedAmount
            )}
          </strong>

          <small>
            Approved project value
          </small>

        </div>


        <div className="project-kpi-card">

          <span>Expenditure</span>

          <strong>
            {formatCurrency(
              project.expenditure
            )}
          </strong>

          <small>
            Recorded expenditure
          </small>

        </div>


        <div className="project-kpi-card">

          <span>Utilization</span>

          <strong>
            {utilization === null
              ? "—"
              : `${utilization.toFixed(1)}%`}
          </strong>

          <div className="utilization-track">

            <div
              style={{
                width: `${Math.min(
                  utilization || 0,
                  100
                )}%`
              }}
            />

          </div>

        </div>


        <div className="project-kpi-card">

          <span>Duration</span>

          <strong>
            {duration === null
              ? "—"
              : `${duration} days`}
          </strong>

          <small>
            Start to completion
          </small>

        </div>

      </section>


      {/* =====================================================
          INFORMATION GRID
      ====================================================== */}

      <section className="project-information-grid">

        {/* BASIC DETAILS */}

        <div className="project-panel">

          <div className="project-panel-header">

            <div>
              <span>PROJECT PROFILE</span>
              <h2>Basic details</h2>
            </div>

          </div>

          <div className="project-detail-grid">

            <DetailItem
              label="Project Type"
              value={project.projectType}
            />

            <DetailItem
              label="State"
              value={project.state}
            />

            <DetailItem
              label="District"
              value={project.district}
            />

            <DetailItem
              label="Constituency"
              value={project.constituency}
            />

            <DetailItem
              label="Contractor"
              value={project.contractor}
            />

            <DetailItem
              label="Implementing Agency"
              value={project.implementingAgency}
            />

          </div>

        </div>


        {/* TIMELINE */}

        <div className="project-panel">

          <div className="project-panel-header">

            <div>
              <span>PROJECT TIMELINE</span>
              <h2>Execution period</h2>
            </div>

          </div>

          <div className="timeline">

            <div className="timeline-item">

              <div className="timeline-marker start"></div>

              <div>
                <span>Start date</span>
                <strong>
                  {formatDate(project.startDate)}
                </strong>
              </div>

            </div>


            <div className="timeline-line"></div>


            <div className="timeline-item">

              <div className="timeline-marker end"></div>

              <div>
                <span>Completion date</span>
                <strong>
                  {formatDate(project.completionDate)}
                </strong>
              </div>

            </div>


            <div className="timeline-summary">

              <span>Total duration</span>

              <strong>
                {duration === null
                  ? "Not available"
                  : `${duration} days`}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TECHNICAL PROFILE
      ====================================================== */}

      {technicalData.length > 0 && (

        <section className="project-panel technical-panel">

          <div className="project-panel-header">

            <div>
              <span>TECHNICAL PROFILE</span>
              <h2>
                {project.projectType} project characteristics
              </h2>
            </div>

            <span className="technical-source">
              Project dataset
            </span>

          </div>


          <div className="technical-grid">

            {technicalData.map(
              ([label, value]) => (

                <TechnicalItem
                  key={label}
                  label={label}
                  value={value}
                />

              )
            )}

          </div>

        </section>

      )}


      {/* =====================================================
          RISK ENTRY
      ====================================================== */}

      <section className="project-risk-entry">

        <div className="risk-entry-content">

          <div className="risk-entry-icon">
            ◈
          </div>

          <div>

            <span>
              NEXT STEP
            </span>

            <h2>
              Review the project's risk evidence
            </h2>

            <p>
              Examine financial and timeline indicators,
              comparable-project evidence, machine-learning
              signals and explainable risk reasons.
            </p>

          </div>

        </div>


        <button
          onClick={() =>
            navigate(
              `/risk-analysis?projectId=${project.id}`
            )
          }
        >
          Analyze Project
          <span>→</span>
        </button>

      </section>


      {/* =====================================================
          DISCLAIMER
      ====================================================== */}

      <div className="project-details-disclaimer">

        <span>i</span>

        <p>
          The system identifies unusual patterns and risk
          indicators for further examination. It does not
          establish fraud or misconduct.
        </p>

      </div>

    </div>
  );
}

export default ProjectDetails;