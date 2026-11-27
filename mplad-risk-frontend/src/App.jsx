import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ImportData from "./pages/ImportData";
import ProjectDetails from "./pages/ProjectDetails";
import RiskAnalysis from "./pages/RiskAnalysis";
import Comparison from "./pages/Comparison";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Projects */}
          <Route
            path="/projects"
            element={<Projects />}
          />

          {/* Manual Project Entry */}
          <Route
            path="/projects/new"
            element={<NewProject />}
          />

          {/* CSV Data Import */}
          <Route
            path="/projects/import"
            element={<ImportData />}
          />

          {/* Project Details */}
          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

          {/* Risk Analysis */}
          <Route
            path="/risk-analysis"
            element={<RiskAnalysis />}
          />

          {/* Comparison */}
          <Route
            path="/comparison"
            element={<Comparison />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;