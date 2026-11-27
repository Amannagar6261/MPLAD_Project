package com.mplad.mpladrisksystem.controller;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import com.mplad.mpladrisksystem.service.MlRiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class MlRiskController {

    private final ProjectRepository projectRepository;
    private final MlRiskService mlRiskService;

    public MlRiskController(
            ProjectRepository projectRepository,
            MlRiskService mlRiskService
    ) {
        this.projectRepository = projectRepository;
        this.mlRiskService = mlRiskService;
    }

    @GetMapping("/{id}/ml-risk")
    public ResponseEntity<?> getMlRisk(@PathVariable Long id) {

        Project project = projectRepository.findById(id).orElse(null);

        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        double sanctionedAmount =
                project.getSanctionedAmount() != null
                        ? project.getSanctionedAmount()
                        : 0.0;

        double expenditure =
                project.getExpenditure() != null
                        ? project.getExpenditure()
                        : 0.0;

        double expenditureRatio =
                sanctionedAmount > 0
                        ? expenditure / sanctionedAmount
                        : 0.0;

        double durationDays = calculateDuration(project);

        double costPerUnit = calculateCostPerUnit(project);

        Map<String, Object> mlResult =
                mlRiskService.predictRisk(
                        sanctionedAmount,
                        expenditure,
                        expenditureRatio,
                        durationDays,
                        costPerUnit
                );

        return ResponseEntity.ok(
                Map.of(
                        "projectId", project.getId(),
                        "projectCode", project.getProjectCode(),
                        "projectName", project.getProjectName(),
                        "projectType", project.getProjectType(),
                        "sanctionedAmount", sanctionedAmount,
                        "expenditure", expenditure,
                        "expenditureRatio", expenditureRatio,
                        "durationDays", durationDays,
                        "costPerUnit", costPerUnit,
                        "mlResult", mlResult
                )
        );
    }


    // =========================================================
    // PROJECT DURATION
    // =========================================================

    private double calculateDuration(Project project) {

        LocalDate start = project.getStartDate();
        LocalDate completion = project.getCompletionDate();

        if (start == null || completion == null) {
            return 0.0;
        }

        return ChronoUnit.DAYS.between(start, completion);
    }


    // =========================================================
    // TYPE-SPECIFIC COST PER UNIT
    // =========================================================

    private double calculateCostPerUnit(Project project) {

        if (project.getSanctionedAmount() == null) {
            return 0.0;
        }

        double sanctionedAmount = project.getSanctionedAmount();

        if (sanctionedAmount <= 0) {
            return 0.0;
        }

        String type = project.getProjectType();

        if (type == null) {
            return 0.0;
        }

        switch (type.trim().toLowerCase()) {

            // =====================================================
            // ROAD
            // Cost per KM
            // =====================================================

            case "road":

                if (project.getRoadProjectDetails() != null
                        && project.getRoadProjectDetails().getRoadLengthKm() != null
                        && project.getRoadProjectDetails().getRoadLengthKm() > 0) {

                    return sanctionedAmount /
                            project.getRoadProjectDetails().getRoadLengthKm();
                }

                break;


            // =====================================================
            // BRIDGE
            // Cost per Meter
            // =====================================================

            case "bridge":

                if (project.getBridgeProjectDetails() != null
                        && project.getBridgeProjectDetails().getBridgeLengthMeter() != null
                        && project.getBridgeProjectDetails().getBridgeLengthMeter() > 0) {

                    return sanctionedAmount /
                            project.getBridgeProjectDetails().getBridgeLengthMeter();
                }

                break;


            // =====================================================
            // EDUCATION
            // Cost per Classroom
            // =====================================================

            case "education":

                if (project.getSchoolProjectDetails() != null
                        && project.getSchoolProjectDetails().getClassroomCount() != null
                        && project.getSchoolProjectDetails().getClassroomCount() > 0) {

                    return sanctionedAmount /
                            project.getSchoolProjectDetails().getClassroomCount();
                }

                break;


            // =====================================================
            // HEALTHCARE
            // Cost per Bed
            // =====================================================

            case "healthcare":

                if (project.getHealthProjectDetails() != null
                        && project.getHealthProjectDetails().getBedCount() != null
                        && project.getHealthProjectDetails().getBedCount() > 0) {

                    return sanctionedAmount /
                            project.getHealthProjectDetails().getBedCount();
                }

                break;


            // =====================================================
            // WATER SUPPLY
            // Cost per Beneficiary
            // =====================================================

            case "water supply":

                if (project.getWaterSupplyProjectDetails() != null
                        && project.getWaterSupplyProjectDetails().getBeneficiaryCount() != null
                        && project.getWaterSupplyProjectDetails().getBeneficiaryCount() > 0) {

                    return sanctionedAmount /
                            project.getWaterSupplyProjectDetails().getBeneficiaryCount();
                }

                break;


            // =====================================================
            // IRRIGATION
            // Cost per Irrigated Area
            // =====================================================

            case "irrigation":

                if (project.getIrrigationProjectDetails() != null
                        && project.getIrrigationProjectDetails().getIrrigatedArea() != null
                        && project.getIrrigationProjectDetails().getIrrigatedArea() > 0) {

                    return sanctionedAmount /
                            project.getIrrigationProjectDetails().getIrrigatedArea();
                }

                break;


            // =====================================================
            // ELECTRICITY
            // Cost per KM of Line
            // =====================================================

            case "electricity":

                if (project.getElectricityProjectDetails() != null
                        && project.getElectricityProjectDetails().getLineLengthKm() != null
                        && project.getElectricityProjectDetails().getLineLengthKm() > 0) {

                    return sanctionedAmount /
                            project.getElectricityProjectDetails().getLineLengthKm();
                }

                break;


            // =====================================================
            // SANITATION
            // Cost per Beneficiary
            // =====================================================

            case "sanitation":

                if (project.getGenericProjectDetails() != null
                        && project.getGenericProjectDetails().getBeneficiaryCount() != null
                        && project.getGenericProjectDetails().getBeneficiaryCount() > 0) {

                    return sanctionedAmount /
                            project.getGenericProjectDetails().getBeneficiaryCount();
                }

                break;


            // =====================================================
            // COMMUNITY
            // Cost per Beneficiary
            // =====================================================

            case "community":

                if (project.getGenericProjectDetails() != null
                        && project.getGenericProjectDetails().getBeneficiaryCount() != null
                        && project.getGenericProjectDetails().getBeneficiaryCount() > 0) {

                    return sanctionedAmount /
                            project.getGenericProjectDetails().getBeneficiaryCount();
                }

                break;


            // =====================================================
            // UNKNOWN PROJECT TYPE
            // =====================================================

            default:

                return 0.0;
        }

        return 0.0;
    }
}