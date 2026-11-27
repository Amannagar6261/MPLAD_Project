package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.*;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectComparisonService {

    private static final int TARGET_PEER_COUNT = 20;
    private static final int MIN_PREFERRED_PEERS = 8;

    private final ProjectRepository projectRepository;

    public ProjectComparisonService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Map<String, Object> compareProject(Long projectId) {

        Project currentProject = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found with id: " + projectId));

        List<Project> allProjects = projectRepository.findAll();

        // =========================================================
        // STEP 1: SAME PROJECT TYPE IS MANDATORY
        // =========================================================

        List<Project> sameTypeProjects = allProjects.stream()
                .filter(project -> !project.getId().equals(currentProject.getId()))
                .filter(project ->
                        project.getProjectType() != null
                                && currentProject.getProjectType() != null
                                && project.getProjectType()
                                .trim()
                                .equalsIgnoreCase(
                                        currentProject.getProjectType().trim()))
                .collect(Collectors.toList());

        // =========================================================
        // STEP 2: SELECT GENUINELY COMPARABLE PEERS
        // =========================================================

        PeerSelection peerSelection =
                selectComparableProjects(currentProject, sameTypeProjects);

        List<Project> comparableProjects = peerSelection.projects;

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("projectId", currentProject.getId());
        result.put("projectCode", currentProject.getProjectCode());
        result.put("projectType", currentProject.getProjectType());

        result.put("sameTypeProjectCount", sameTypeProjects.size());
        result.put("comparableProjectCount", comparableProjects.size());

        // =========================================================
        // PROJECT SCALE
        // =========================================================

        result.put("currentProjectScale",
                getScaleValue(currentProject));

        result.put("scaleUnit",
                getScaleUnit(currentProject));

        // =========================================================
        // PEER SELECTION INFORMATION
        // =========================================================

        result.put("peerSelectionLevel",
                peerSelection.level);

        result.put("peerSelectionCriteria",
                peerSelection.criteria);

        result.put("minimumPreferredPeers",
                MIN_PREFERRED_PEERS);

        // =========================================================
        // COST COMPARISON
        // =========================================================

        addCostComparison(
                result,
                currentProject,
                comparableProjects
        );

        // =========================================================
        // EXPENDITURE COMPARISON
        // =========================================================

        addExpenditureComparison(
                result,
                currentProject,
                comparableProjects
        );

        // =========================================================
        // DURATION COMPARISON
        // =========================================================

        addDurationComparison(
                result,
                currentProject,
                comparableProjects
        );

        // =========================================================
        // COMPARABLE PROJECT DETAILS
        // =========================================================

        List<Map<String, Object>> comparableProjectDetails =
                comparableProjects.stream()
                        .map(project -> {

                            Map<String, Object> item =
                                    new LinkedHashMap<>();

                            item.put("id", project.getId());
                            item.put("projectCode", project.getProjectCode());
                            item.put("projectName", project.getProjectName());
                            item.put("state", project.getState());
                            item.put("district", project.getDistrict());
                            item.put("projectType", project.getProjectType());
                            item.put("sanctionedAmount",
                                    project.getSanctionedAmount());
                            item.put("expenditure",
                                    project.getExpenditure());
                            item.put("projectScale",
                                    getScaleValue(project));
                            item.put("scaleUnit",
                                    getScaleUnit(project));
                            item.put("durationDays",
                                    calculateDuration(project));
                            item.put("costPerUnit",
                                    positiveOrNull(
                                            calculateCostPerUnit(project)));

                            return item;
                        })
                        .collect(Collectors.toList());

        result.put("comparableProjects",
                comparableProjectDetails);

        // =========================================================
        // COMPARISON INFORMATION
        // =========================================================

        result.put(
                "comparisonMethod",
                "Same project type, comparable project scale, geographic proximity and nearby project year with controlled fallback"
        );

        result.put(
                "interpretation",
                "Comparison results are statistical evidence for project review. They do not by themselves establish fraud, misconduct or wrongdoing."
        );

        result.put(
                "note",
                "Peer statistics are derived from the available project dataset and are not official MPLADS cost benchmarks."
        );

        return result;
    }

    // =============================================================
    // PEER SELECTION
    // =============================================================

    private PeerSelection selectComparableProjects(
            Project current,
            List<Project> sameTypeProjects) {

        if (sameTypeProjects.isEmpty()) {
            return new PeerSelection(
                    Collections.emptyList(),
                    "NO_PEERS",
                    "No other project of the same project type was found."
            );
        }

        Double currentScale = getScaleValue(current);
        Integer currentYear = getProjectYear(current);

        /*
         * LEVEL 1
         *
         * Same type
         * + scale between 0.5x and 2.0x
         * + same district
         * + year difference <= 3
         */
        List<Project> level1 = sameTypeProjects.stream()
                .filter(project ->
                        isComparableScale(currentScale,
                                getScaleValue(project)))
                .filter(project ->
                        isSameDistrict(current, project))
                .filter(project ->
                        isYearWithin(currentYear,
                                getProjectYear(project), 3))
                .collect(Collectors.toList());

        if (level1.size() >= MIN_PREFERRED_PEERS) {

            return new PeerSelection(
                    sortPeers(current, level1),
                    "LEVEL_1",
                    "Same project type + comparable scale (0.5x to 2.0x) + same district + project year within 3 years"
            );
        }

        /*
         * LEVEL 2
         *
         * Same type
         * + comparable scale
         * + same state
         * + year difference <= 5
         */
        List<Project> level2 = sameTypeProjects.stream()
                .filter(project ->
                        isComparableScale(currentScale,
                                getScaleValue(project)))
                .filter(project ->
                        isSameState(current, project))
                .filter(project ->
                        isYearWithin(currentYear,
                                getProjectYear(project), 5))
                .collect(Collectors.toList());

        if (level2.size() >= MIN_PREFERRED_PEERS) {

            return new PeerSelection(
                    sortPeers(current, level2),
                    "LEVEL_2",
                    "Same project type + comparable scale (0.5x to 2.0x) + same state + project year within 5 years"
            );
        }

        /*
         * LEVEL 3
         *
         * Same type
         * + comparable scale
         *
         * Location/year are relaxed because there are not enough
         * strong peers.
         */
        List<Project> level3 = sameTypeProjects.stream()
                .filter(project ->
                        isComparableScale(currentScale,
                                getScaleValue(project)))
                .collect(Collectors.toList());

        if (!level3.isEmpty()) {

            return new PeerSelection(
                    sortPeers(current, level3),
                    "LEVEL_3",
                    "Same project type + comparable scale (0.5x to 2.0x); geographic and year restrictions relaxed because of limited peers"
            );
        }

        /*
         * LEVEL 4
         *
         * Final fallback:
         * same project type only.
         *
         * This is explicitly reported so the officer knows that
         * the peer group is weaker.
         */
        return new PeerSelection(
                sortPeers(current, sameTypeProjects),
                "LEVEL_4",
                "Same project type only; scale, location and year restrictions relaxed because sufficient comparable peers were unavailable"
        );
    }

    private List<Project> sortPeers(
            Project current,
            List<Project> projects) {

        return projects.stream()
                .sorted(
                        Comparator
                                .comparingInt(
                                        (Project project) ->
                                                geographicPriority(
                                                        current, project))
                                .thenComparingInt(
                                        project ->
                                                yearDifference(
                                                        current, project))
                                .thenComparingDouble(
                                        project ->
                                                scaleDifferenceRatio(
                                                        current, project))
                )
                .limit(TARGET_PEER_COUNT)
                .collect(Collectors.toList());
    }

    private int geographicPriority(
            Project current,
            Project candidate) {

        if (isSameDistrict(current, candidate)) {
            return 0;
        }

        if (isSameState(current, candidate)) {
            return 1;
        }

        return 2;
    }

    private int yearDifference(
            Project current,
            Project candidate) {

        Integer currentYear = getProjectYear(current);
        Integer candidateYear = getProjectYear(candidate);

        if (currentYear == null || candidateYear == null) {
            return Integer.MAX_VALUE;
        }

        return Math.abs(currentYear - candidateYear);
    }

    private double scaleDifferenceRatio(
            Project current,
            Project candidate) {

        Double currentScale = getScaleValue(current);
        Double candidateScale = getScaleValue(candidate);

        if (currentScale == null
                || candidateScale == null
                || currentScale <= 0
                || candidateScale <= 0) {
            return Double.MAX_VALUE;
        }

        return Math.abs(
                Math.log(candidateScale / currentScale));
    }

    private boolean isComparableScale(
            Double currentScale,
            Double candidateScale) {

        if (currentScale == null
                || candidateScale == null
                || currentScale <= 0
                || candidateScale <= 0) {

            return false;
        }

        double ratio =
                candidateScale / currentScale;

        return ratio >= 0.5 && ratio <= 2.0;
    }

    private boolean isSameDistrict(
            Project current,
            Project candidate) {

        return current.getDistrict() != null
                && candidate.getDistrict() != null
                && current.getDistrict()
                .trim()
                .equalsIgnoreCase(
                        candidate.getDistrict().trim());
    }

    private boolean isSameState(
            Project current,
            Project candidate) {

        return current.getState() != null
                && candidate.getState() != null
                && current.getState()
                .trim()
                .equalsIgnoreCase(
                        candidate.getState().trim());
    }

    private boolean isYearWithin(
            Integer currentYear,
            Integer candidateYear,
            int maximumDifference) {

        if (currentYear == null
                || candidateYear == null) {
            return false;
        }

        return Math.abs(
                currentYear - candidateYear)
                <= maximumDifference;
    }

    // =============================================================
    // COST COMPARISON
    // =============================================================

    private void addCostComparison(
            Map<String, Object> result,
            Project currentProject,
            List<Project> comparableProjects) {

        double currentCost =
                calculateCostPerUnit(currentProject);

        result.put(
                "currentCostPerUnit",
                currentCost > 0
                        ? round(currentCost)
                        : null
        );

        result.put(
                "costMetric",
                getCostMetricName(currentProject)
        );

        if (currentCost <= 0
                || comparableProjects.isEmpty()) {

            putNullCostStatistics(result);
            return;
        }

        List<Double> peerCosts =
                comparableProjects.stream()
                        .map(this::calculateCostPerUnit)
                        .filter(value -> value > 0)
                        .sorted()
                        .collect(Collectors.toList());

        if (peerCosts.isEmpty()) {
            putNullCostStatistics(result);
            return;
        }

        addStatistics(
                result,
                "cost",
                currentCost,
                peerCosts
        );
    }

    // =============================================================
    // EXPENDITURE COMPARISON
    // =============================================================

    private void addExpenditureComparison(
            Map<String, Object> result,
            Project currentProject,
            List<Project> comparableProjects) {

        if (currentProject.getSanctionedAmount() == null
                || currentProject.getExpenditure() == null
                || currentProject.getSanctionedAmount() <= 0) {

            putNullExpenditureStatistics(result);
            return;
        }

        double currentRatio =
                currentProject.getExpenditure()
                        / currentProject.getSanctionedAmount();

        result.put(
                "currentExpenditureRatio",
                round(currentRatio)
        );

        List<Double> peerRatios =
                comparableProjects.stream()
                        .filter(project ->
                                project.getSanctionedAmount() != null
                                        && project.getExpenditure() != null
                                        && project.getSanctionedAmount() > 0)
                        .map(project ->
                                project.getExpenditure()
                                        / project.getSanctionedAmount())
                        .filter(value -> Double.isFinite(value))
                        .sorted()
                        .collect(Collectors.toList());

        if (peerRatios.isEmpty()) {
            putNullExpenditurePeerStatistics(result);
            return;
        }

        addStatistics(
                result,
                "expenditure",
                currentRatio,
                peerRatios
        );
    }

    // =============================================================
    // DURATION COMPARISON
    // =============================================================

    private void addDurationComparison(
            Map<String, Object> result,
            Project currentProject,
            List<Project> comparableProjects) {

        double currentDuration =
                calculateDuration(currentProject);

        result.put(
                "currentDurationDays",
                currentDuration > 0
                        ? round(currentDuration)
                        : null
        );

        if (currentDuration <= 0
                || comparableProjects.isEmpty()) {

            putNullDurationStatistics(result);
            return;
        }

        List<Double> peerDurations =
                comparableProjects.stream()
                        .map(this::calculateDuration)
                        .filter(value -> value > 0)
                        .sorted()
                        .collect(Collectors.toList());

        if (peerDurations.isEmpty()) {
            putNullDurationStatistics(result);
            return;
        }

        addStatistics(
                result,
                "duration",
                currentDuration,
                peerDurations
        );
    }

    // =============================================================
    // GENERIC STATISTICAL COMPARISON
    // =============================================================

    private void addStatistics(
            Map<String, Object> result,
            String prefix,
            double currentValue,
            List<Double> peerValues) {

        double p25 =
                calculatePercentile(peerValues, 25);

        double median =
                calculatePercentile(peerValues, 50);

        double p75 =
                calculatePercentile(peerValues, 75);

        double deviation = 0.0;

        if (median != 0) {
            deviation =
                    ((currentValue - median)
                            / median) * 100.0;
        }

        double percentilePosition =
                calculatePercentilePosition(
                        currentValue,
                        peerValues
                );

        result.put(
                "peerP25" + capitalize(prefix),
                round(p25)
        );

        result.put(
                "peerMedian" + capitalize(prefix),
                round(median)
        );

        result.put(
                "peerP75" + capitalize(prefix),
                round(p75)
        );

        result.put(
                prefix + "DeviationPercentage",
                round(deviation)
        );

        result.put(
                prefix + "PercentilePosition",
                round(percentilePosition)
        );

        result.put(
                prefix + "PeerCount",
                peerValues.size()
        );
    }

    // =============================================================
    // NULL STATISTICS
    // =============================================================

    private void putNullCostStatistics(
            Map<String, Object> result) {

        result.put("peerP25Cost", null);
        result.put("peerMedianCost", null);
        result.put("peerP75Cost", null);
        result.put("costDeviationPercentage", null);
        result.put("costPercentilePosition", null);
        result.put("costPeerCount", 0);
    }

    private void putNullExpenditureStatistics(
            Map<String, Object> result) {

        result.put("currentExpenditureRatio", null);
        putNullExpenditurePeerStatistics(result);
    }

    private void putNullExpenditurePeerStatistics(
            Map<String, Object> result) {

        result.put("peerP25Expenditure", null);
        result.put("peerMedianExpenditure", null);
        result.put("peerP75Expenditure", null);
        result.put("expenditureDeviationPercentage", null);
        result.put("expenditurePercentilePosition", null);
        result.put("expenditurePeerCount", 0);
    }

    private void putNullDurationStatistics(
            Map<String, Object> result) {

        result.put("peerP25Duration", null);
        result.put("peerMedianDuration", null);
        result.put("peerP75Duration", null);
        result.put("durationDeviationPercentage", null);
        result.put("durationPercentilePosition", null);
        result.put("durationPeerCount", 0);
    }

    // =============================================================
    // PERCENTILE
    // =============================================================

    private double calculatePercentile(
            List<Double> values,
            double percentile) {

        if (values == null
                || values.isEmpty()) {
            return 0.0;
        }

        if (values.size() == 1) {
            return values.get(0);
        }

        double position =
                (percentile / 100.0)
                        * (values.size() - 1);

        int lower =
                (int) Math.floor(position);

        int upper =
                (int) Math.ceil(position);

        if (lower == upper) {
            return values.get(lower);
        }

        double fraction =
                position - lower;

        return values.get(lower)
                + fraction
                * (values.get(upper)
                - values.get(lower));
    }

    // =============================================================
    // PERCENTILE POSITION
    // =============================================================

    private double calculatePercentilePosition(
            double currentValue,
            List<Double> peerValues) {

        if (peerValues == null
                || peerValues.isEmpty()) {
            return 0.0;
        }

        long below =
                peerValues.stream()
                        .filter(value ->
                                value < currentValue)
                        .count();

        long equal =
                peerValues.stream()
                        .filter(value ->
                                value == currentValue)
                        .count();

        /*
         * Mid-rank percentile:
         *
         * (values below + 0.5 * values equal) / N
         *
         * multiplied by 100.
         */
        return (
                (below + (0.5 * equal))
                        / peerValues.size()
        ) * 100.0;
    }

    // =============================================================
    // COST PER UNIT
    // =============================================================

    private double calculateCostPerUnit(Project project) {

        if (project.getSanctionedAmount() == null
                || project.getSanctionedAmount() <= 0) {
            return 0.0;
        }

        double amount =
                project.getSanctionedAmount();

        String type =
                project.getProjectType();

        if (type == null) {
            return 0.0;
        }

        switch (type.trim().toLowerCase()) {

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

    // =============================================================
    // SCALE VALUE
    // =============================================================

    private Double getScaleValue(Project project) {

        if (project.getProjectType() == null) {
            return null;
        }

        switch (project.getProjectType()
                .trim()
                .toLowerCase()) {

            case "road":

                if (project.getRoadProjectDetails() != null) {
                    return project.getRoadProjectDetails()
                            .getRoadLengthKm();
                }

                break;

            case "bridge":

                if (project.getBridgeProjectDetails() != null) {
                    return project.getBridgeProjectDetails()
                            .getBridgeLengthMeter();
                }

                break;

            case "education":

                if (project.getSchoolProjectDetails() != null
                        && project.getSchoolProjectDetails()
                        .getClassroomCount() != null) {

                    return project.getSchoolProjectDetails()
                            .getClassroomCount()
                            .doubleValue();
                }

                break;

            case "healthcare":

                if (project.getHealthProjectDetails() != null
                        && project.getHealthProjectDetails()
                        .getBedCount() != null) {

                    return project.getHealthProjectDetails()
                            .getBedCount()
                            .doubleValue();
                }

                break;

            case "water supply":

                if (project.getWaterSupplyProjectDetails() != null
                        && project.getWaterSupplyProjectDetails()
                        .getBeneficiaryCount() != null) {

                    return project.getWaterSupplyProjectDetails()
                            .getBeneficiaryCount()
                            .doubleValue();
                }

                break;

            case "irrigation":

                if (project.getIrrigationProjectDetails() != null) {
                    return project.getIrrigationProjectDetails()
                            .getIrrigatedArea();
                }

                break;

            case "electricity":

                if (project.getElectricityProjectDetails() != null) {
                    return project.getElectricityProjectDetails()
                            .getLineLengthKm();
                }

                break;

            case "sanitation":
            case "community":

                if (project.getGenericProjectDetails() != null) {
                    return project.getGenericProjectDetails()
                            .getBeneficiaryCount();
                }

                break;

            default:
                return null;
        }

        return null;
    }

    // =============================================================
    // SCALE UNIT
    // =============================================================

    private String getScaleUnit(Project project) {

        if (project.getProjectType() == null) {
            return null;
        }

        switch (project.getProjectType()
                .trim()
                .toLowerCase()) {

            case "road":
                return "km";

            case "bridge":
                return "meter";

            case "education":
                return "classrooms";

            case "healthcare":
                return "beds";

            case "water supply":
                return "beneficiaries";

            case "irrigation":
                return "area";

            case "electricity":
                return "km";

            case "sanitation":
            case "community":
                return "beneficiaries";

            default:
                return null;
        }
    }

    // =============================================================
    // COST METRIC NAME
    // =============================================================

    private String getCostMetricName(Project project) {

        if (project.getProjectType() == null) {
            return null;
        }

        switch (project.getProjectType()
                .trim()
                .toLowerCase()) {

            case "road":
                return "sanctioned amount per km";

            case "bridge":
                return "sanctioned amount per meter";

            case "education":
                return "sanctioned amount per classroom";

            case "healthcare":
                return "sanctioned amount per bed";

            case "water supply":
                return "sanctioned amount per beneficiary";

            case "irrigation":
                return "sanctioned amount per irrigated area";

            case "electricity":
                return "sanctioned amount per km";

            case "sanitation":
            case "community":
                return "sanctioned amount per beneficiary";

            default:
                return null;
        }
    }

    // =============================================================
    // PROJECT YEAR
    // =============================================================

    private Integer getProjectYear(Project project) {

        LocalDate date =
                project.getStartDate();

        if (date == null) {
            return null;
        }

        return date.getYear();
    }

    // =============================================================
    // PROJECT DURATION
    // =============================================================

    private double calculateDuration(Project project) {

        if (project.getStartDate() == null
                || project.getCompletionDate() == null) {
            return 0.0;
        }

        return ChronoUnit.DAYS.between(
                project.getStartDate(),
                project.getCompletionDate()
        );
    }

    // =============================================================
    // HELPERS
    // =============================================================

    private String capitalize(String value) {

        if (value == null || value.isEmpty()) {
            return value;
        }

        return value.substring(0, 1).toUpperCase()
                + value.substring(1);
    }

    private Double positiveOrNull(double value) {

        return value > 0 ? round(value) : null;
    }

    private double round(double value) {

        return Math.round(value * 10000.0)
                / 10000.0;
    }

    // =============================================================
    // PEER SELECTION RESULT
    // =============================================================

    private static class PeerSelection {

        private final List<Project> projects;
        private final String level;
        private final String criteria;

        private PeerSelection(
                List<Project> projects,
                String level,
                String criteria) {

            this.projects = projects;
            this.level = level;
            this.criteria = criteria;
        }
    }
}