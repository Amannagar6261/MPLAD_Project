package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import com.mplad.mpladrisksystem.service.ProjectFeatureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectFeatureController {

    private final ProjectRepository projectRepository;
    private final ProjectFeatureService projectFeatureService;

    public ProjectFeatureController(
            ProjectRepository projectRepository,
            ProjectFeatureService projectFeatureService) {

        this.projectRepository = projectRepository;
        this.projectFeatureService = projectFeatureService;
    }

    // ==========================================
    // GET PROJECT FEATURES
    // ==========================================

    @GetMapping("/{id}/features")
    public ResponseEntity<?> getProjectFeatures(
            @PathVariable Long id) {

        Project project = projectRepository.findById(id)
                .orElse(null);

        if (project == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Project not found with id: " + id);
        }

        Map<String, Object> features =
                projectFeatureService.extractFeatures(project);

        return ResponseEntity.ok(features);
    }
}