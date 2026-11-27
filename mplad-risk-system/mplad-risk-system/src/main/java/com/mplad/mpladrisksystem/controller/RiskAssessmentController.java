package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.service.ProjectService;
import com.mplad.mpladrisksystem.service.RiskAssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class RiskAssessmentController {

    private final ProjectService projectService;
    private final RiskAssessmentService riskAssessmentService;

    public RiskAssessmentController(
            ProjectService projectService,
            RiskAssessmentService riskAssessmentService) {

        this.projectService = projectService;
        this.riskAssessmentService = riskAssessmentService;
    }

    @GetMapping("/{id}/risk")
    public ResponseEntity<?> assessRisk(@PathVariable Long id) {

        Project project = projectService.getProjectById(id);

        if (project == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Project not found");

            return ResponseEntity.notFound().build();
        }

        RiskAssessmentService.RiskAssessmentResult result =
                riskAssessmentService.assessProject(id);

        Map<String, Object> response = new HashMap<>();

        response.put("projectId", result.getProject().getId());
        response.put("projectCode", result.getProject().getProjectCode());
        response.put("projectName", result.getProject().getProjectName());

        response.put("score", result.getScore());
        response.put("riskLevel", result.getRiskLevel());

        RiskAssessmentService.ScoreBreakdown breakdown =
                result.getScoreBreakdown();

        Map<String, Integer> scoreBreakdown = new HashMap<>();

        scoreBreakdown.put(
                "directFinancialTimeline",
                breakdown.getDirectFinancialTimeline()
        );

        scoreBreakdown.put(
                "comparableProjects",
                breakdown.getComparableProjects()
        );

        scoreBreakdown.put(
                "machineLearning",
                breakdown.getMachineLearning()
        );

        scoreBreakdown.put(
                "dataQuality",
                breakdown.getDataQuality()
        );

        scoreBreakdown.put(
                "total",
                breakdown.getTotal()
        );

        response.put("scoreBreakdown", scoreBreakdown);

        List<String> reasons = result.getReasons();

        response.put("reasons", reasons);

        return ResponseEntity.ok(response);
    }
}