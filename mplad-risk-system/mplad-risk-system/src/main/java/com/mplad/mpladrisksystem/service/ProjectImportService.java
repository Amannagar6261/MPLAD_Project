package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectImportService {

    private final ProjectRepository projectRepository;

    public ProjectImportService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ImportResult importCsv(MultipartFile file) throws Exception {

        List<Project> projects = new ArrayList<>();
        List<String> duplicateCodes = new ArrayList<>();

        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        file.getInputStream(),
                        StandardCharsets.UTF_8))) {

            CSVParser csvParser = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(reader);

            for (CSVRecord record : csvParser) {

                totalRows++;

                String projectCode = record.get("projectCode");

                if (projectRepository.existsByProjectCode(projectCode)) {
                    duplicateCodes.add(projectCode);
                    continue;
                }

                Project project = new Project();

                project.setProjectCode(projectCode);
                project.setProjectName(record.get("projectName"));
                project.setState(record.get("state"));
                project.setDistrict(record.get("district"));
                project.setConstituency(record.get("constituency"));
                project.setProjectType(record.get("projectType"));

                project.setSanctionedAmount(
                        Double.parseDouble(record.get("sanctionedAmount"))
                );

                project.setExpenditure(
                        Double.parseDouble(record.get("expenditure"))
                );

                project.setStartDate(
                        LocalDate.parse(record.get("startDate"))
                );

                project.setCompletionDate(
                        LocalDate.parse(record.get("completionDate"))
                );

                project.setContractor(record.get("contractor"));
                project.setImplementingAgency(
                        record.get("implementingAgency")
                );
                project.setStatus(record.get("status"));

                projects.add(project);
            }
        }

        projectRepository.saveAll(projects);

        return new ImportResult(
                totalRows,
                projects.size(),
                duplicateCodes.size(),
                duplicateCodes
        );
    }

    public static class ImportResult {

        private int totalRows;
        private int imported;
        private int duplicates;
        private List<String> duplicateCodes;

        public ImportResult(
                int totalRows,
                int imported,
                int duplicates,
                List<String> duplicateCodes) {

            this.totalRows = totalRows;
            this.imported = imported;
            this.duplicates = duplicates;
            this.duplicateCodes = duplicateCodes;
        }

        public int getTotalRows() {
            return totalRows;
        }

        public int getImported() {
            return imported;
        }

        public int getDuplicates() {
            return duplicates;
        }

        public List<String> getDuplicateCodes() {
            return duplicateCodes;
        }
    }
}