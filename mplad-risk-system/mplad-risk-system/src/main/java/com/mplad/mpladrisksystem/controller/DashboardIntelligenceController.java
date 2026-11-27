package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.service.DashboardIntelligenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardIntelligenceController {

    private final DashboardIntelligenceService dashboardIntelligenceService;

    public DashboardIntelligenceController(
            DashboardIntelligenceService dashboardIntelligenceService) {

        this.dashboardIntelligenceService =
                dashboardIntelligenceService;
    }

    @GetMapping("/intelligence")
    public ResponseEntity<?> getIntelligence() {

        return ResponseEntity.ok(
                dashboardIntelligenceService
                        .getDashboardIntelligence()
        );
    }
}