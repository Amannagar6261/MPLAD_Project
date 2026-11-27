import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ImportData.css";

const API_BASE_URL = "http://localhost:8080";

function ImportData() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // CSV PARSER
  // =========================================================

  const parseCsvLine = (line) => {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const character = line[i];

      if (character === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (character === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += character;
      }
    }

    values.push(current.trim());

    return values;
  };

  // =========================================================
  // FILE PREVIEW
  // =========================================================

  const readFilePreview = (file) => {
    setError("");
    setResult(null);

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result || "";

      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);

      if (lines.length === 0) {
        setError("The CSV file does not contain any data.");
        setPreview(null);
        return;
      }

      const headers = parseCsvLine(lines[0]);

      const rows = lines.slice(1, 6).map((line) => {
        const values = parseCsvLine(line);
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        return row;
      });

      setPreview({
        totalRows: Math.max(lines.length - 1, 0),
        columns: headers,
        rows,
      });
    };

    reader.onerror = () => {
      setError("Unable to read the selected CSV file.");
      setPreview(null);
    };

    reader.readAsText(file);
  };

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    readFilePreview(file);
  };

  // =========================================================
  // DRAG DROP
  // =========================================================

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    readFilePreview(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  // =========================================================
  // OPEN FILE
  // =========================================================

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // =========================================================
  // IMPORT
  // =========================================================

  const handleImport = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    setError("");
    setResult(null);
    setImporting(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/api/projects/import/full-csv`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "The backend could not import this CSV file."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Import failed. Make sure the Spring Boot backend is running."
      );
    } finally {
      setImporting(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const resetImport = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="import-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="import-page-header">

        <div>

          <button
            type="button"
            className="import-back-button"
            onClick={() => navigate("/projects")}
          >
            ← Back to Projects
          </button>

          <div className="import-eyebrow">
            DATA INGESTION
          </div>

          <h1>
            Import Project Data
          </h1>

          <p>
            Upload a project dataset and let the system validate,
            import and analyze project records through the
            intelligence workflow.
          </p>

        </div>

        <button
          type="button"
          className="manual-entry-button"
          onClick={() => navigate("/projects/new")}
        >
          Manual Entry →
        </button>

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="import-error">

          <div className="import-error-icon">
            !
          </div>

          <div>

            <strong>
              Import issue
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          UPLOAD / PREVIEW AREA
          ===================================================== */}

      {!result && (
        <>

          {/* UPLOAD */}

          <section className="upload-card">

            <div
              className={
                dragging
                  ? "upload-zone dragging"
                  : "upload-zone"
              }
              onClick={openFilePicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                hidden
              />

              <div className="upload-icon">
                ↑
              </div>

              <h2>
                {selectedFile
                  ? "CSV file selected"
                  : "Drop your CSV file here"}
              </h2>

              <p>
                or click to browse from your computer
              </p>

              <span className="upload-format">
                CSV files only
              </span>

            </div>

            {selectedFile && (
              <div className="selected-file">

                <div className="selected-file-icon">
                  CSV
                </div>

                <div className="selected-file-info">

                  <strong>
                    {selectedFile.name}
                  </strong>

                  <span>
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>

                </div>

                <button
                  type="button"
                  className="remove-file-button"
                  onClick={resetImport}
                >
                  ×
                </button>

              </div>
            )}

          </section>

          {/* PREVIEW */}

          {preview && (
            <section className="preview-card">

              <div className="section-header">

                <div>

                  <span className="section-eyebrow">
                    IMPORT PREVIEW
                  </span>

                  <h2>
                    Dataset detected
                  </h2>

                  <p>
                    Review the detected structure before importing.
                  </p>

                </div>

                <div className="preview-count">

                  <strong>
                    {preview.totalRows}
                  </strong>

                  <span>
                    records
                  </span>

                </div>

              </div>

              <div className="preview-stats">

                <div>
                  <strong>
                    {preview.totalRows}
                  </strong>

                  <span>
                    Rows detected
                  </span>
                </div>

                <div>
                  <strong>
                    {preview.columns.length}
                  </strong>

                  <span>
                    Columns detected
                  </span>
                </div>

                <div>

                  <strong>
                    {preview.columns.includes("projectCode")
                      ? "Ready"
                      : "Check"}
                  </strong>

                  <span>
                    Project mapping
                  </span>

                </div>

              </div>

              <div className="column-list">

                <span className="column-label">
                  DETECTED COLUMNS
                </span>

                <div className="column-tags">

                  {preview.columns.map((column) => (
                    <span key={column}>
                      {column}
                    </span>
                  ))}

                </div>

              </div>

              <div className="data-preview">

                <div className="data-preview-header">

                  <span>
                    FIRST RECORDS
                  </span>

                  <small>
                    Showing up to 5 rows
                  </small>

                </div>

                <div className="table-scroll">

                  <table>

                    <thead>

                      <tr>

                        {preview.columns
                          .slice(0, 8)
                          .map((column) => (
                            <th key={column}>
                              {column}
                            </th>
                          ))}

                      </tr>

                    </thead>

                    <tbody>

                      {preview.rows.map(
                        (row, rowIndex) => (
                          <tr key={rowIndex}>

                            {preview.columns
                              .slice(0, 8)
                              .map((column) => (
                                <td key={column}>
                                  {row[column] || "—"}
                                </td>
                              ))}

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              <div className="preview-note">

                <span>
                  ⓘ
                </span>

                <p>
                  The backend will perform the actual import and
                  duplicate handling. This preview does not modify
                  the database.
                </p>

              </div>

            </section>
          )}

          {/* ACTIONS */}

          <div className="import-actions">

            <button
              type="button"
              className="cancel-import-button"
              onClick={() => navigate("/projects")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="import-button"
              disabled={!selectedFile || importing}
              onClick={handleImport}
            >
              {importing
                ? "Importing Projects..."
                : "Import Projects →"}
            </button>

          </div>

        </>
      )}

      {/* =====================================================
          SUCCESS SCREEN
          ===================================================== */}

      {result && (
        <section className="success-card">

          <div className="success-icon">
            ✓
          </div>

          <span className="success-eyebrow">
            IMPORT COMPLETED
          </span>

          <h2>
            Project data imported successfully
          </h2>

          <p>
            The dataset has been processed through the project
            ingestion and intelligence workflow.
          </p>

          {/* RESULT STATISTICS */}

          <div className="result-grid">

            <div>
              <strong>
                {result.totalRows ?? 0}
              </strong>

              <span>
                Total rows
              </span>
            </div>

            <div>
              <strong>
                {result.updatedProjects ?? 0}
              </strong>

              <span>
                Imported / updated
              </span>
            </div>

            <div>
              <strong>
                {result.skippedProjects ?? 0}
              </strong>

              <span>
                Skipped
              </span>
            </div>

            <div>
              <strong>
                {result.assessedProjects ?? 0}
              </strong>

              <span>
                Risk assessed
              </span>
            </div>

            <div>
              <strong>
                {result.assessmentFailedProjects ?? 0}
              </strong>

              <span>
                Assessment failed
              </span>
            </div>

          </div>

          {/* INTELLIGENCE STATUS */}

          <div className="success-intelligence">

            <div className="success-intelligence-header">

              <div className="success-intelligence-check">
                ✓
              </div>

              <strong>
                Intelligence analysis completed
              </strong>

            </div>

            <p>
              {result.assessedProjects ?? 0} imported projects
              received a stored risk assessment.
            </p>

          </div>

          {/* SKIPPED PROJECTS */}

          {Array.isArray(result.skippedCodes) &&
            result.skippedCodes.length > 0 && (
              <div className="skipped-projects">

                <strong>
                  Skipped project codes
                </strong>

                <div>

                  {result.skippedCodes
                    .slice(0, 20)
                    .map((code) => (
                      <span key={code}>
                        {code}
                      </span>
                    ))}

                </div>

              </div>
            )}

          {/* ACTION BUTTONS */}

          <div className="success-actions">

            <button
              type="button"
              className="secondary-import-action"
              onClick={resetImport}
            >
              Import Another File
            </button>

            <button
              type="button"
              className="primary-import-action"
              onClick={() => navigate("/projects")}
            >
              View Projects →
            </button>

          </div>

        </section>
      )}

      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <div className="import-disclaimer">

        <strong>
          Data processing
        </strong>

        <span>
          Uploaded data is processed through the project ingestion
          workflow. Risk assessment and anomaly analysis use the
          platform's existing intelligence services and do not
          establish fraud or misconduct.
        </span>

      </div>

    </div>
  );
}

export default ImportData;