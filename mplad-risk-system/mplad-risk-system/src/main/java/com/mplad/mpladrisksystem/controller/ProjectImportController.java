package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.service.ProjectImportService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/projects/import")
public class ProjectImportController {

    private final ProjectImportService projectImportService;

    public ProjectImportController(ProjectImportService projectImportService) {
        this.projectImportService = projectImportService;
    }

    @PostMapping(
            value = "/csv",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String uploadCsv(@RequestPart("file") MultipartFile file) {

        if (file.isEmpty()) {
            return "Please upload a CSV file";
        }

        try {
            ProjectImportService.ImportResult result =
                    projectImportService.importCsv(file);

            return "Total rows: " + result.getTotalRows()
                    + "\nImported: " + result.getImported()
                    + "\nDuplicates: " + result.getDuplicates()
                    + "\nDuplicate codes: " + result.getDuplicateCodes();

        } catch (Exception e) {
            return "Error while importing CSV: " + e.getMessage();
        }
    }
}