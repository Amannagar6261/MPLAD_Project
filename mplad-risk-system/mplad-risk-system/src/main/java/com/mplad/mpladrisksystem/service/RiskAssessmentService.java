package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.model.RiskScore;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import com.mplad.mpladrisksystem.repository.RiskScoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RiskAssessmentService {

    private final ProjectRepository projectRepository;
    private final RiskScoreRepository riskScoreRepository;
    private final ProjectComparisonService comparisonService;
    private final MlRiskService mlRiskService;

    public RiskAssessmentService(
            ProjectRepository projectRepository,
            RiskScoreRepository riskScoreRepository,
            ProjectComparisonService comparisonService,
            MlRiskService mlRiskService) {

        this.projectRepository = projectRepository;
        this.riskScoreRepository = riskScoreRepository;
        this.comparisonService = comparisonService;
        this.mlRiskService = mlRiskService;
    }

    // =========================================================
    // MAIN UNIFIED RISK ASSESSMENT
    // =========================================================

    public RiskAssessmentResult assessProject(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Project not found with id: " + projectId
                        )
                );

        List<String> reasons = new ArrayList<>();

        /*
         * FINAL RISK SCORE ARCHITECTURE
         *
         * Direct Financial & Timeline Evidence : 35
         * Comparable Project Evidence          : 35
         * Machine Learning Evidence            : 25
         * Data Quality Evidence               : 5
         *
         * TOTAL                                : 100
         */

        // ---------------------------------------------------------
        // 1. DIRECT FINANCIAL + TIMELINE
        // ---------------------------------------------------------

        int directFinancialTimeline =
                calculateRuleBasedEvidence(
                        project,
                        reasons
                );

        // ---------------------------------------------------------
        // 2. COMPARABLE PROJECTS
        // ---------------------------------------------------------

        int comparableProjects =
                calculateComparisonEvidence(
                        projectId,
                        reasons
                );

        // ---------------------------------------------------------
        // 3. MACHINE LEARNING
        // ---------------------------------------------------------

        int machineLearning =
                calculateMlEvidence(
                        project,
                        reasons
                );

        // ---------------------------------------------------------
        // 4. DATA QUALITY
        // ---------------------------------------------------------

        int dataQuality =
                calculateDataQualityEvidence(
                        project,
                        reasons
                );

        // ---------------------------------------------------------
        // FINAL SCORE
        // ---------------------------------------------------------

        int finalScore =
                directFinancialTimeline
                        + comparableProjects
                        + machineLearning
                        + dataQuality;

        finalScore = Math.max(
                0,
                Math.min(100, finalScore)
        );

        String riskLevel =
                determineRiskLevel(finalScore);

        // ---------------------------------------------------------
        // FALLBACK REASON
        // ---------------------------------------------------------

        if (reasons.isEmpty()) {

            reasons.add(
                    "No significant unusual pattern was identified from the available indicators."
            );
        }

        // ---------------------------------------------------------
        // SAVE RESULT
        // ---------------------------------------------------------

        saveRiskScore(
                project,
                finalScore,
                riskLevel
        );

        // ---------------------------------------------------------
        // SCORE BREAKDOWN
        // ---------------------------------------------------------

        ScoreBreakdown scoreBreakdown =
                new ScoreBreakdown(
                        directFinancialTimeline,
                        comparableProjects,
                        machineLearning,
                        dataQuality,
                        finalScore
                );

        return new RiskAssessmentResult(
                project,
                finalScore,
                riskLevel,
                scoreBreakdown,
                reasons
        );
    }

    // =========================================================
    // 1. DIRECT FINANCIAL + TIMELINE EVIDENCE
    // MAXIMUM = 35
    // =========================================================

    private int calculateRuleBasedEvidence(
            Project project,
            List<String> reasons) {

        int score = 0;

        // ---------------------------------------------------------
        // FINANCIAL UTILIZATION
        // ---------------------------------------------------------

        if (project.getSanctionedAmount() != null
                && project.getExpenditure() != null
                && project.getSanctionedAmount() > 0) {

            double ratio =
                    project.getExpenditure()
                            / project.getSanctionedAmount();

            if (ratio > 1.0) {

                score += 25;

                reasons.add(
                        "Expenditure exceeds the sanctioned amount."
                );

            } else if (ratio > 0.95) {

                score += 20;

                reasons.add(
                        "Expenditure is above 95% of the sanctioned amount."
                );

            } else if (ratio > 0.80) {

                score += 15;

                reasons.add(
                        "Expenditure is above 80% of the sanctioned amount."
                );

            } else if (ratio > 0.60) {

                score += 5;

                reasons.add(
                        "Expenditure is above 60% of the sanctioned amount."
                );
            }
        }

        // ---------------------------------------------------------
        // PROJECT DURATION
        // ---------------------------------------------------------

        if (project.getStartDate() != null
                && project.getCompletionDate() != null) {

            long duration =
                    ChronoUnit.DAYS.between(
                            project.getStartDate(),
                            project.getCompletionDate()
                    );

            if (duration > 730) {

                score += 10;

                reasons.add(
                        "Project duration exceeds two years."
                );

            } else if (duration > 365) {

                score += 8;

                reasons.add(
                        "Project duration exceeds one year."
                );

            } else if (duration > 180) {

                score += 5;

                reasons.add(
                        "Project duration exceeds six months."
                );

            } else if (duration > 90) {

                score += 2;

                reasons.add(
                        "Project duration exceeds three months."
                );
            }
        }

        // ---------------------------------------------------------
        // PROJECT STATUS
        // ---------------------------------------------------------

        if (project.getStatus() != null) {

            String status =
                    project.getStatus()
                            .trim()
                            .toLowerCase();

            if (status.equals("delayed")) {

                score += 5;

                reasons.add(
                        "Project status indicates delay."
                );
            }
        }

        /*
         * Raw maximum:
         *
         * Financial = 25
         * Duration  = 10
         * Status    = 5
         *
         * Raw = 40
         *
         * Component maximum = 35
         */

        return Math.min(score, 35);
    }

    // =========================================================
    // 2. COMPARABLE PROJECT EVIDENCE
    // MAXIMUM = 35
    // =========================================================

    private int calculateComparisonEvidence(
            Long projectId,
            List<String> reasons) {

        try {

            Map<String, Object> comparison =
                    comparisonService.compareProject(projectId);

            int score = 0;

            // -----------------------------------------------------
            // COST POSITION
            // -----------------------------------------------------

            Double costPercentile =
                    getDouble(
                            comparison,
                            "costPercentilePosition"
                    );

            if (costPercentile != null) {

                if (costPercentile >= 95) {

                    score += 15;

                    reasons.add(
                            "Cost-per-unit is at an extreme upper percentile compared with comparable projects."
                    );

                } else if (costPercentile >= 90) {

                    score += 12;

                    reasons.add(
                            "Cost-per-unit is in the upper 10% of comparable projects."
                    );

                } else if (costPercentile >= 75) {

                    score += 7;

                    reasons.add(
                            "Cost-per-unit is above the 75th percentile of comparable projects."
                    );
                }
            }

            // -----------------------------------------------------
            // EXPENDITURE POSITION
            // -----------------------------------------------------

            Double expenditurePercentile =
                    getDouble(
                            comparison,
                            "expenditurePercentilePosition"
                    );

            if (expenditurePercentile != null) {

                if (expenditurePercentile >= 95) {

                    score += 10;

                    reasons.add(
                            "Expenditure ratio is at an extreme upper percentile compared with comparable projects."
                    );

                } else if (expenditurePercentile >= 90) {

                    score += 8;

                    reasons.add(
                            "Expenditure ratio is in the upper 10% of comparable projects."
                    );

                } else if (expenditurePercentile >= 75) {

                    score += 5;

                    reasons.add(
                            "Expenditure ratio is above the 75th percentile of comparable projects."
                    );
                }
            }

            // -----------------------------------------------------
            // DURATION POSITION
            // -----------------------------------------------------

            Double durationPercentile =
                    getDouble(
                            comparison,
                            "durationPercentilePosition"
                    );

            if (durationPercentile != null) {

                if (durationPercentile >= 95) {

                    score += 10;

                    reasons.add(
                            "Project duration is at an extreme upper percentile compared with comparable projects."
                    );

                } else if (durationPercentile >= 90) {

                    score += 8;

                    reasons.add(
                            "Project duration is in the upper 10% of comparable projects."
                    );

                } else if (durationPercentile >= 75) {

                    score += 5;

                    reasons.add(
                            "Project duration is above the 75th percentile of comparable projects."
                    );
                }
            }

            /*
             * Maximum comparison contribution = 35.
             */

            return Math.min(score, 35);

        } catch (Exception exception) {

            /*
             * Comparison failure should not crash
             * the complete risk assessment.
             */

            return 0;
        }
    }

    // =========================================================
    // 3. MACHINE LEARNING EVIDENCE
    // MAXIMUM = 25
    //
    // IMPORTANT RULE:
    //
    // isAnomaly = false
    //       -> ML contribution = 0
    //
    // isAnomaly = true
    //       -> ML contribution based on mlRiskScore
    // =========================================================

    private int calculateMlEvidence(
            Project project,
            List<String> reasons) {

        try {

            double sanctionedAmount =
                    safeValue(
                            project.getSanctionedAmount()
                    );

            double expenditure =
                    safeValue(
                            project.getExpenditure()
                    );

            double expenditureRatio = 0.0;

            if (sanctionedAmount > 0) {

                expenditureRatio =
                        expenditure / sanctionedAmount;
            }

            double durationDays =
                    calculateDuration(project);

            double costPerUnit =
                    calculateCostPerUnit(project);

            Map<String, Object> mlResult =
                    mlRiskService.predictRisk(
                            sanctionedAmount,
                            expenditure,
                            expenditureRatio,
                            durationDays,
                            costPerUnit
                    );

            if (mlResult == null) {
                return 0;
            }

            Double mlRiskScore =
                    getDouble(
                            mlResult,
                            "mlRiskScore"
                    );

            Boolean isAnomaly =
                    getBoolean(
                            mlResult,
                            "isAnomaly"
                    );

            // -----------------------------------------------------
            // NO ML RESULT
            // -----------------------------------------------------

            if (mlRiskScore == null) {
                return 0;
            }

            /*
             * IMPORTANT:
             *
             * If Isolation Forest did NOT classify the
             * project as an anomaly, it contributes ZERO
             * points to the final risk score.
             */

            if (!Boolean.TRUE.equals(isAnomaly)) {
                return 0;
            }

            // -----------------------------------------------------
            // ACTUAL ML ANOMALY
            // -----------------------------------------------------

            int contribution =
                    (int) Math.round(
                            (mlRiskScore / 100.0) * 25.0
                    );

            contribution =
                    Math.max(
                            0,
                            Math.min(25, contribution)
                    );

            reasons.add(
                    "Machine-learning anomaly detection identified the project as an unusual observation relative to the training data."
            );

            return contribution;

        } catch (Exception exception) {

            /*
             * ML service failure should not make
             * the entire risk assessment fail.
             */

            return 0;
        }
    }

    // =========================================================
    // 4. DATA QUALITY EVIDENCE
    // MAXIMUM = 5
    // =========================================================

    private int calculateDataQualityEvidence(
            Project project,
            List<String> reasons) {

        int score = 0;

        // ---------------------------------------------------------
        // SANCTIONED AMOUNT
        // ---------------------------------------------------------

        if (project.getSanctionedAmount() == null) {

            score += 1;

            reasons.add(
                    "Sanctioned amount is missing."
            );
        }

        // ---------------------------------------------------------
        // EXPENDITURE
        // ---------------------------------------------------------

        if (project.getExpenditure() == null) {

            score += 1;

            reasons.add(
                    "Expenditure information is missing."
            );
        }

        // ---------------------------------------------------------
        // START DATE
        // ---------------------------------------------------------

        if (project.getStartDate() == null) {

            score += 1;

            reasons.add(
                    "Project start date is missing."
            );
        }

        // ---------------------------------------------------------
        // COMPLETION DATE
        // ---------------------------------------------------------

        if (project.getCompletionDate() == null) {

            score += 1;

            reasons.add(
                    "Project completion date is missing."
            );
        }

        // ---------------------------------------------------------
        // PROJECT TYPE
        // ---------------------------------------------------------

        if (project.getProjectType() == null
                || project.getProjectType().isBlank()) {

            score += 1;

            reasons.add(
                    "Project type is missing."
            );
        }

        return Math.min(score, 5);
    }

    // =========================================================
    // COST PER UNIT
    // =========================================================

    private double calculateCostPerUnit(
            Project project) {

        if (project.getSanctionedAmount() == null
                || project.getSanctionedAmount() <= 0) {

            return 0.0;
        }

        double amount =
                project.getSanctionedAmount();

        if (project.getProjectType() == null) {
            return 0.0;
        }

        String type =
                project.getProjectType()
                        .trim()
                        .toLowerCase();

        switch (type) {

            // -----------------------------------------------------
            // ROAD
            // -----------------------------------------------------

            case "road":

                if (project.getRoadProjectDetails() != null
                        && project.getRoadProjectDetails()
                        .getRoadLengthKm() != null
                        && project.getRoadProjectDetails()
                        .getRoadLengthKm() > 0) {

                    return amount /
                            project.getRoadProjectDetails()
                                    .getRoadLengthKm();
                }

                break;

            // -----------------------------------------------------
            // BRIDGE
            // -----------------------------------------------------

            case "bridge":

                if (project.getBridgeProjectDetails() != null
                        && project.getBridgeProjectDetails()
                        .getBridgeLengthMeter() != null
                        && project.getBridgeProjectDetails()
                        .getBridgeLengthMeter() > 0) {

                    return amount /
                            project.getBridgeProjectDetails()
                                    .getBridgeLengthMeter();
                }

                break;

            // -----------------------------------------------------
            // EDUCATION
            // -----------------------------------------------------

            case "education":

                if (project.getSchoolProjectDetails() != null
                        && project.getSchoolProjectDetails()
                        .getClassroomCount() != null
                        && project.getSchoolProjectDetails()
                        .getClassroomCount() > 0) {

                    return amount /
                            project.getSchoolProjectDetails()
                                    .getClassroomCount();
                }

                break;

            // -----------------------------------------------------
            // HEALTHCARE
            // -----------------------------------------------------

            case "healthcare":

                if (project.getHealthProjectDetails() != null
                        && project.getHealthProjectDetails()
                        .getBedCount() != null
                        && project.getHealthProjectDetails()
                        .getBedCount() > 0) {

                    return amount /
                            project.getHealthProjectDetails()
                                    .getBedCount();
                }

                break;

            // -----------------------------------------------------
            // WATER SUPPLY
            // -----------------------------------------------------

            case "water supply":

                if (project.getWaterSupplyProjectDetails() != null
                        && project.getWaterSupplyProjectDetails()
                        .getBeneficiaryCount() != null
                        && project.getWaterSupplyProjectDetails()
                        .getBeneficiaryCount() > 0) {

                    return amount /
                            project.getWaterSupplyProjectDetails()
                                    .getBeneficiaryCount();
                }

                break;

            // -----------------------------------------------------
            // IRRIGATION
            // -----------------------------------------------------

            case "irrigation":

                if (project.getIrrigationProjectDetails() != null
                        && project.getIrrigationProjectDetails()
                        .getIrrigatedArea() != null
                        && project.getIrrigationProjectDetails()
                        .getIrrigatedArea() > 0) {

                    return amount /
                            project.getIrrigationProjectDetails()
                                    .getIrrigatedArea();
                }

                break;

            // -----------------------------------------------------
            // ELECTRICITY
            // -----------------------------------------------------

            case "electricity":

                if (project.getElectricityProjectDetails() != null
                        && project.getElectricityProjectDetails()
                        .getLineLengthKm() != null
                        && project.getElectricityProjectDetails()
                        .getLineLengthKm() > 0) {

                    return amount /
                            project.getElectricityProjectDetails()
                                    .getLineLengthKm();
                }

                break;

            // -----------------------------------------------------
            // SANITATION / COMMUNITY
            // -----------------------------------------------------

            case "sanitation":
            case "community":

                if (project.getGenericProjectDetails() != null
                        && project.getGenericProjectDetails()
                        .getBeneficiaryCount() != null
                        && project.getGenericProjectDetails()
                        .getBeneficiaryCount() > 0) {

                    return amount /
                            project.getGenericProjectDetails()
                                    .getBeneficiaryCount();
                }

                break;

            default:

                return 0.0;
        }

        return 0.0;
    }

    // =========================================================
    // PROJECT DURATION
    // =========================================================

    private double calculateDuration(
            Project project) {

        if (project.getStartDate() == null
                || project.getCompletionDate() == null) {

            return 0.0;
        }

        return ChronoUnit.DAYS.between(
                project.getStartDate(),
                project.getCompletionDate()
        );
    }

    // =========================================================
    // SAFE VALUE
    // =========================================================

    private double safeValue(
            Double value) {

        if (value == null
                || !Double.isFinite(value)
                || value < 0) {

            return 0.0;
        }

        return value;
    }

    // =========================================================
    // MAP DOUBLE HELPER
    // =========================================================

    private Double getDouble(
            Map<String, Object> map,
            String key) {

        if (map == null
                || !map.containsKey(key)) {

            return null;
        }

        Object value =
                map.get(key);

        if (value instanceof Number) {

            return ((Number) value).doubleValue();
        }

        try {

            if (value != null) {

                return Double.parseDouble(
                        value.toString()
                );
            }

        } catch (NumberFormatException ignored) {
        }

        return null;
    }

    // =========================================================
    // MAP BOOLEAN HELPER
    // =========================================================

    private Boolean getBoolean(
            Map<String, Object> map,
            String key) {

        if (map == null
                || !map.containsKey(key)) {

            return null;
        }

        Object value =
                map.get(key);

        if (value == null) {
            return null;
        }

        if (value instanceof Boolean) {
            return (Boolean) value;
        }

        if (value instanceof Number) {
            return ((Number) value).doubleValue() != 0;
        }

        String normalized =
                value.toString()
                        .trim()
                        .toLowerCase();

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

    // =========================================================
    // RISK LEVEL
    // =========================================================

    private String determineRiskLevel(
            int score) {

        if (score <= 30) {
            return "LOW";
        }

        if (score <= 60) {
            return "MEDIUM";
        }

        if (score <= 80) {
            return "HIGH";
        }

        return "CRITICAL";
    }

    // =========================================================
    // SAVE / UPDATE RISK SCORE
    // =========================================================

    private void saveRiskScore(
            Project project,
            int score,
            String riskLevel) {

        RiskScore riskScore =
                riskScoreRepository
                        .findByProjectId(
                                project.getId()
                        )
                        .orElse(
                                new RiskScore()
                        );

        riskScore.setProject(project);
        riskScore.setScore(score);
        riskScore.setRiskLevel(riskLevel);
        riskScore.setAssessedAt(
                LocalDateTime.now()
        );

        riskScoreRepository.save(
                riskScore
        );
    }

    // =========================================================
    // SCORE BREAKDOWN
    // =========================================================

    public static class ScoreBreakdown {

        private final int directFinancialTimeline;
        private final int comparableProjects;
        private final int machineLearning;
        private final int dataQuality;
        private final int total;

        public ScoreBreakdown(
                int directFinancialTimeline,
                int comparableProjects,
                int machineLearning,
                int dataQuality,
                int total) {

            this.directFinancialTimeline =
                    directFinancialTimeline;

            this.comparableProjects =
                    comparableProjects;

            this.machineLearning =
                    machineLearning;

            this.dataQuality =
                    dataQuality;

            this.total =
                    total;
        }

        public int getDirectFinancialTimeline() {
            return directFinancialTimeline;
        }

        public int getComparableProjects() {
            return comparableProjects;
        }

        public int getMachineLearning() {
            return machineLearning;
        }

        public int getDataQuality() {
            return dataQuality;
        }

        public int getTotal() {
            return total;
        }
    }

    // =========================================================
    // RESULT CLASS
    // =========================================================

    public static class RiskAssessmentResult {

        private final Project project;
        private final int score;
        private final String riskLevel;
        private final ScoreBreakdown scoreBreakdown;
        private final List<String> reasons;

        public RiskAssessmentResult(
                Project project,
                int score,
                String riskLevel,
                ScoreBreakdown scoreBreakdown,
                List<String> reasons) {

            this.project = project;
            this.score = score;
            this.riskLevel = riskLevel;
            this.scoreBreakdown = scoreBreakdown;
            this.reasons = reasons;
        }

        public Project getProject() {
            return project;
        }

        public int getScore() {
            return score;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public ScoreBreakdown getScoreBreakdown() {
            return scoreBreakdown;
        }

        public List<String> getReasons() {
            return reasons;
        }
    }
}