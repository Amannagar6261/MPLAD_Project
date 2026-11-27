package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.service.ProjectComparisonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectComparisonController {

    private final ProjectComparisonService projectComparisonService;

    public ProjectComparisonController(
            ProjectComparisonService projectComparisonService) {
        this.projectComparisonService = projectComparisonService;
    }

    @GetMapping("/{id}/comparison")
    public ResponseEntity<?> compareProject(
            @PathVariable Long id) {

        try {

            Map<String, Object> result =
                    projectComparisonService.compareProject(id);

            return ResponseEntity.ok(result);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}