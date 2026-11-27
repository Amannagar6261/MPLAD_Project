package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.service.TechnicalDataImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/projects/import")
public class TechnicalDataImportController {

    private final TechnicalDataImportService technicalDataImportService;

    public TechnicalDataImportController(
            TechnicalDataImportService technicalDataImportService) {

        this.technicalDataImportService = technicalDataImportService;
    }

    @PostMapping(
            value = "/full-csv",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> importFullCsv(
            @RequestParam("file") MultipartFile file) {

        try {

            // Check whether file was selected
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please upload a CSV file.");
            }

            // Check file extension
            String fileName = file.getOriginalFilename();

            if (fileName == null ||
                    !fileName.toLowerCase().endsWith(".csv")) {

                return ResponseEntity.badRequest()
                        .body("Only CSV files are allowed.");
            }

            // Import full technical dataset
            TechnicalDataImportService.ImportResult result =
                    technicalDataImportService.importFullCsv(file);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Import failed: " + e.getMessage());
        }
    }
}