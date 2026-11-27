package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.*;
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
public class TechnicalDataImportService {

    private final ProjectRepository projectRepository;
    private final RiskAssessmentService riskAssessmentService;

    public TechnicalDataImportService(
            ProjectRepository projectRepository,
            RiskAssessmentService riskAssessmentService) {

        this.projectRepository = projectRepository;
        this.riskAssessmentService = riskAssessmentService;
    }

    public ImportResult importFullCsv(MultipartFile file) throws Exception {

        int totalRows = 0;
        int updatedProjects = 0;
        int skippedProjects = 0;

        int assessedProjects = 0;
        int assessmentFailedProjects = 0;

        List<String> skippedCodes = new ArrayList<>();
        List<String> assessmentErrors = new ArrayList<>();
        List<Long> importedProjectIds = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        file.getInputStream(),
                        StandardCharsets.UTF_8))) {

            CSVParser csvParser = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .build()
                    .parse(reader);

            for (CSVRecord record : csvParser) {

                totalRows++;

                String projectCode =
                        getValue(record, "projectCode");

                if (projectCode == null || projectCode.isBlank()) {
                    skippedProjects++;
                    skippedCodes.add("(empty projectCode)");
                    continue;
                }

                /*
                 * Existing project -> UPDATE
                 * New project      -> CREATE
                 */
                Project project =
                        projectRepository
                                .findByProjectCode(projectCode)
                                .orElseGet(Project::new);

                String projectName =
                        getValue(record, "projectName");

                String projectType =
                        getValue(record, "projectType");

                if (projectName == null || projectName.isBlank()) {
                    skippedProjects++;
                    skippedCodes.add(projectCode);
                    continue;
                }

                if (projectType == null || projectType.isBlank()) {
                    skippedProjects++;
                    skippedCodes.add(projectCode);
                    continue;
                }

                // =====================================================
                // COMMON PROJECT DATA
                // =====================================================

                project.setProjectCode(projectCode);
                project.setProjectName(projectName);

                project.setState(
                        getValue(record, "state")
                );

                project.setDistrict(
                        getValue(record, "district")
                );

                project.setConstituency(
                        getValue(record, "constituency")
                );

                project.setProjectType(projectType);

                project.setSanctionedAmount(
                        getDouble(record, "sanctionedAmount")
                );

                project.setExpenditure(
                        getDouble(record, "expenditure")
                );

                project.setStartDate(
                        getDate(record, "startDate")
                );

                project.setCompletionDate(
                        getDate(record, "completionDate")
                );

                project.setContractor(
                        getValue(record, "contractor")
                );

                project.setImplementingAgency(
                        getValue(record, "implementingAgency")
                );

                project.setStatus(
                        getValue(record, "status")
                );

                // =====================================================
                // TECHNICAL DATA
                // =====================================================

                switch (projectType.trim().toLowerCase()) {

                    // =================================================
                    // EDUCATION
                    // =================================================

                    case "education":

                        SchoolProjectDetails school =
                                new SchoolProjectDetails();

                        school.setBuiltUpArea(
                                getDouble(record, "builtUpArea")
                        );

                        school.setClassroomCount(
                                getInteger(record, "classroomCount")
                        );

                        school.setLabCount(
                                getInteger(record, "labCount")
                        );

                        school.setLibraryAvailable(
                                getBoolean(
                                        record,
                                        "libraryAvailable"
                                )
                        );

                        school.setToiletCount(
                                getInteger(record, "toiletCount")
                        );

                        school.setDrinkingWaterAvailable(
                                getBoolean(
                                        record,
                                        "drinkingWaterAvailable"
                                )
                        );

                        school.setBoundaryWall(
                                getBoolean(
                                        record,
                                        "boundaryWall"
                                )
                        );

                        project.setSchoolProjectDetails(school);

                        break;

                    // =================================================
                    // ROAD
                    // =================================================

                    case "road":

                        RoadProjectDetails road =
                                new RoadProjectDetails();

                        road.setRoadLengthKm(
                                getDouble(
                                        record,
                                        "roadLengthKm"
                                )
                        );

                        road.setRoadWidth(
                                getDouble(
                                        record,
                                        "roadWidthMeter"
                                )
                        );

                        road.setRoadType(
                                getValue(
                                        record,
                                        "roadType"
                                )
                        );

                        road.setShoulderWork(
                                getBoolean(
                                        record,
                                        "shoulderWork"
                                )
                        );

                        road.setDrainageWork(
                                getBoolean(
                                        record,
                                        "drainageWork"
                                )
                        );

                        road.setCulvertCount(
                                getInteger(
                                        record,
                                        "culvertCount"
                                )
                        );

                        project.setRoadProjectDetails(road);

                        break;

                    // =================================================
                    // WATER SUPPLY
                    // =================================================

                    case "water supply":

                        WaterSupplyProjectDetails water =
                                new WaterSupplyProjectDetails();

                        water.setCapacity(
                                getDouble(
                                        record,
                                        "capacity"
                                )
                        );

                        water.setCapacityUnit(
                                getValue(
                                        record,
                                        "capacityUnit"
                                )
                        );

                        water.setWaterSource(
                                getValue(
                                        record,
                                        "waterSource"
                                )
                        );

                        water.setSupplyType(
                                getValue(
                                        record,
                                        "supplyType"
                                )
                        );

                        water.setBeneficiaryCount(
                                getInteger(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        water.setPipelineLengthKm(
                                getDouble(
                                        record,
                                        "pipelineLengthKm"
                                )
                        );

                        water.setStorageTank(
                                getBoolean(
                                        record,
                                        "storageTank"
                                )
                        );

                        water.setTreatmentFacility(
                                getBoolean(
                                        record,
                                        "treatmentFacility"
                                )
                        );

                        project.setWaterSupplyProjectDetails(water);

                        break;

                    // =================================================
                    // BRIDGE
                    // =================================================

                    case "bridge":

                        BridgeProjectDetails bridge =
                                new BridgeProjectDetails();

                        bridge.setBridgeLengthMeter(
                                getDouble(
                                        record,
                                        "bridgeLengthMeter"
                                )
                        );

                        bridge.setBridgeWidthMeter(
                                getDouble(
                                        record,
                                        "bridgeWidthMeter"
                                )
                        );

                        bridge.setBridgeType(
                                getValue(
                                        record,
                                        "bridgeType"
                                )
                        );

                        bridge.setConstructionMaterial(
                                getValue(
                                        record,
                                        "constructionMaterial"
                                )
                        );

                        bridge.setSpanCount(
                                getInteger(
                                        record,
                                        "spanCount"
                                )
                        );

                        bridge.setApproachRoad(
                                getBoolean(
                                        record,
                                        "approachRoad"
                                )
                        );

                        bridge.setDrainageWork(
                                getBoolean(
                                        record,
                                        "drainageWork"
                                )
                        );

                        project.setBridgeProjectDetails(bridge);

                        break;

                    // =================================================
                    // HEALTHCARE
                    // =================================================

                    case "healthcare":

                        HealthProjectDetails health =
                                new HealthProjectDetails();

                        health.setFacilityType(
                                getValue(
                                        record,
                                        "facilityType"
                                )
                        );

                        health.setBedCount(
                                getInteger(
                                        record,
                                        "bedCount"
                                )
                        );

                        health.setBuiltUpArea(
                                getDouble(
                                        record,
                                        "builtUpArea"
                                )
                        );

                        health.setRoomCount(
                                getInteger(
                                        record,
                                        "roomCount"
                                )
                        );

                        health.setEquipmentCount(
                                getInteger(
                                        record,
                                        "equipmentCount"
                                )
                        );

                        health.setBeneficiaryCount(
                                getInteger(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        health.setElectricityAvailable(
                                getBoolean(
                                        record,
                                        "electricityAvailable"
                                )
                        );

                        health.setDrinkingWaterAvailable(
                                getBoolean(
                                        record,
                                        "drinkingWaterAvailable"
                                )
                        );

                        health.setSanitationAvailable(
                                getBoolean(
                                        record,
                                        "sanitationAvailable"
                                )
                        );

                        project.setHealthProjectDetails(health);

                        break;

                    // =================================================
                    // IRRIGATION
                    // =================================================

                    case "irrigation":

                        IrrigationProjectDetails irrigation =
                                new IrrigationProjectDetails();

                        irrigation.setIrrigationType(
                                getValue(
                                        record,
                                        "irrigationType"
                                )
                        );

                        irrigation.setIrrigatedArea(
                                getDouble(
                                        record,
                                        "irrigatedArea"
                                )
                        );

                        irrigation.setAreaUnit(
                                getValue(
                                        record,
                                        "areaUnit"
                                )
                        );

                        irrigation.setCanalLengthKm(
                                getDouble(
                                        record,
                                        "canalLengthKm"
                                )
                        );

                        irrigation.setPipelineLengthKm(
                                getDouble(
                                        record,
                                        "pipelineLengthKm"
                                )
                        );

                        irrigation.setBeneficiaryCount(
                                getInteger(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        irrigation.setWaterStorageCapacity(
                                getDouble(
                                        record,
                                        "waterStorageCapacity"
                                )
                        );

                        irrigation.setWaterSource(
                                getValue(
                                        record,
                                        "waterSource"
                                )
                        );

                        irrigation.setPumpInstalled(
                                getBoolean(
                                        record,
                                        "pumpInstalled"
                                )
                        );

                        irrigation.setDrainageWork(
                                getBoolean(
                                        record,
                                        "drainageWork"
                                )
                        );

                        project.setIrrigationProjectDetails(
                                irrigation
                        );

                        break;

                    // =================================================
                    // ELECTRICITY
                    // =================================================

                    case "electricity":

                        ElectricityProjectDetails electricity =
                                new ElectricityProjectDetails();

                        electricity.setElectricityWorkType(
                                getValue(
                                        record,
                                        "electricityWorkType"
                                )
                        );

                        electricity.setLineLengthKm(
                                getDouble(
                                        record,
                                        "lineLengthKm"
                                )
                        );

                        electricity.setPoleCount(
                                getInteger(
                                        record,
                                        "poleCount"
                                )
                        );

                        electricity.setTransformerCount(
                                getInteger(
                                        record,
                                        "transformerCount"
                                )
                        );

                        electricity.setTransformerCapacityKva(
                                getDouble(
                                        record,
                                        "transformerCapacityKva"
                                )
                        );

                        electricity.setBeneficiaryCount(
                                getInteger(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        electricity.setStreetLighting(
                                getBoolean(
                                        record,
                                        "streetLighting"
                                )
                        );

                        electricity.setSolarComponent(
                                getBoolean(
                                        record,
                                        "solarComponent"
                                )
                        );

                        project.setElectricityProjectDetails(
                                electricity
                        );

                        break;

                    // =================================================
                    // SANITATION
                    // =================================================

                    case "sanitation":

                        GenericProjectDetails sanitation =
                                new GenericProjectDetails();

                        sanitation.setBeneficiaryCount(
                                getDouble(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        sanitation.setBuiltUpArea(
                                getDouble(
                                        record,
                                        "builtUpArea"
                                )
                        );

                        sanitation.setQuantity(
                                getDouble(
                                        record,
                                        "quantity"
                                )
                        );

                        sanitation.setQuantityUnit(
                                getValue(
                                        record,
                                        "quantityUnit"
                                )
                        );

                        project.setGenericProjectDetails(
                                sanitation
                        );

                        break;

                    // =================================================
                    // COMMUNITY
                    // =================================================

                    case "community":

                        GenericProjectDetails community =
                                new GenericProjectDetails();

                        community.setBeneficiaryCount(
                                getDouble(
                                        record,
                                        "beneficiaryCount"
                                )
                        );

                        community.setBuiltUpArea(
                                getDouble(
                                        record,
                                        "builtUpArea"
                                )
                        );

                        community.setQuantity(
                                getDouble(
                                        record,
                                        "quantity"
                                )
                        );

                        community.setQuantityUnit(
                                getValue(
                                        record,
                                        "quantityUnit"
                                )
                        );

                        project.setGenericProjectDetails(
                                community
                        );

                        break;

                    // =================================================
                    // UNKNOWN TYPE
                    // =================================================

                    default:

                        skippedProjects++;
                        skippedCodes.add(projectCode);

                        continue;
                }

                // =====================================================
                // SAVE PROJECT
                // =====================================================

                Project savedProject =
                        projectRepository.save(project);

                updatedProjects++;

                if (savedProject.getId() != null) {
                    importedProjectIds.add(
                            savedProject.getId()
                    );
                }
            }
        }

        // =============================================================
        // AUTOMATIC INTELLIGENCE ANALYSIS
        // =============================================================

        for (Long projectId : importedProjectIds) {

            try {

                riskAssessmentService.assessProject(projectId);

                assessedProjects++;

            } catch (Exception e) {

                assessmentFailedProjects++;

                assessmentErrors.add(
                        "Project ID "
                                + projectId
                                + ": "
                                + (
                                e.getMessage() != null
                                        ? e.getMessage()
                                        : "Risk assessment failed"
                        )
                );
            }
        }

        return new ImportResult(
                totalRows,
                updatedProjects,
                skippedProjects,
                assessedProjects,
                assessmentFailedProjects,
                skippedCodes,
                assessmentErrors
        );
    }

    // =============================================================
    // GET STRING
    // =============================================================

    private String getValue(
            CSVRecord record,
            String column) {

        if (!record.isMapped(column)) {
            return null;
        }

        String value = record.get(column);

        if (value == null) {
            return null;
        }

        value = value.trim();

        return value.isEmpty()
                ? null
                : value;
    }

    // =============================================================
    // GET DOUBLE
    // =============================================================

    private Double getDouble(
            CSVRecord record,
            String column) {

        String value =
                getValue(record, column);

        if (value == null) {
            return null;
        }

        try {

            return Double.parseDouble(value);

        } catch (NumberFormatException e) {

            return null;
        }
    }

    // =============================================================
    // GET INTEGER
    // =============================================================

    private Integer getInteger(
            CSVRecord record,
            String column) {

        String value =
                getValue(record, column);

        if (value == null) {
            return null;
        }

        try {

            return Integer.parseInt(value);

        } catch (NumberFormatException e) {

            return null;
        }
    }

    // =============================================================
    // GET BOOLEAN
    // =============================================================

    private Boolean getBoolean(
            CSVRecord record,
            String column) {

        String value =
                getValue(record, column);

        if (value == null) {
            return null;
        }

        String normalized =
                value.trim().toLowerCase();

        switch (normalized) {

            case "true":
            case "yes":
            case "y":
            case "1":
                return true;

            case "false":
            case "no":
            case "n":
            case "0":
                return false;

            default:
                return null;
        }
    }

    // =============================================================
    // GET DATE
    // =============================================================

    private LocalDate getDate(
            CSVRecord record,
            String column) {

        String value =
                getValue(record, column);

        if (value == null) {
            return null;
        }

        try {

            return LocalDate.parse(value);

        } catch (Exception e) {

            return null;
        }
    }

    // =============================================================
    // IMPORT RESULT
    // =============================================================

    public static class ImportResult {

        private int totalRows;
        private int updatedProjects;
        private int skippedProjects;

        private int assessedProjects;
        private int assessmentFailedProjects;

        private List<String> skippedCodes;
        private List<String> assessmentErrors;

        public ImportResult(
                int totalRows,
                int updatedProjects,
                int skippedProjects,
                int assessedProjects,
                int assessmentFailedProjects,
                List<String> skippedCodes,
                List<String> assessmentErrors) {

            this.totalRows = totalRows;
            this.updatedProjects = updatedProjects;
            this.skippedProjects = skippedProjects;

            this.assessedProjects = assessedProjects;
            this.assessmentFailedProjects =
                    assessmentFailedProjects;

            this.skippedCodes = skippedCodes;
            this.assessmentErrors = assessmentErrors;
        }

        public int getTotalRows() {
            return totalRows;
        }

        public int getUpdatedProjects() {
            return updatedProjects;
        }

        public int getSkippedProjects() {
            return skippedProjects;
        }

        public int getAssessedProjects() {
            return assessedProjects;
        }

        public int getAssessmentFailedProjects() {
            return assessmentFailedProjects;
        }

        public List<String> getSkippedCodes() {
            return skippedCodes;
        }

        public List<String> getAssessmentErrors() {
            return assessmentErrors;
        }
    }
}