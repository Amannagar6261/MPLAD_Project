package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.model.RiskScore;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import com.mplad.mpladrisksystem.repository.RiskScoreRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardIntelligenceService {

    private final ProjectRepository projectRepository;
    private final RiskScoreRepository riskScoreRepository;

    public DashboardIntelligenceService(
            ProjectRepository projectRepository,
            RiskScoreRepository riskScoreRepository) {

        this.projectRepository = projectRepository;
        this.riskScoreRepository = riskScoreRepository;
    }

    public DashboardIntelligence getDashboardIntelligence() {

        /*
         * IMPORTANT:
         * Dashboard does NOT run the risk engine for all 650 projects.
         *
         * It reads already-persisted RiskScore records.
         * This keeps the dashboard fast and prevents hundreds of
         * ML/comparison calls during page loading.
         */

        List<Project> projects = projectRepository.findAll();
        List<RiskScore> storedRiskScores = riskScoreRepository.findAll();

        Map<Long, RiskScore> riskScoreByProjectId =
                storedRiskScores.stream()
                        .filter(score -> score.getProject() != null)
                        .filter(score -> score.getProject().getId() != null)
                        .collect(Collectors.toMap(
                                score -> score.getProject().getId(),
                                score -> score,
                                (first, second) -> {

                                    /*
                                     * If duplicate records somehow exist,
                                     * keep the most recently assessed one.
                                     */
                                    LocalDateTime firstDate =
                                            first.getAssessedAt();

                                    LocalDateTime secondDate =
                                            second.getAssessedAt();

                                    if (firstDate == null) {
                                        return second;
                                    }

                                    if (secondDate == null) {
                                        return first;
                                    }

                                    return secondDate.isAfter(firstDate)
                                            ? second
                                            : first;
                                }
                        ));

        /*
         * Only projects having a persisted risk assessment
         * are included in risk analytics.
         */
        List<ProjectRiskData> riskData = new ArrayList<>();

        for (Project project : projects) {

            RiskScore storedScore =
                    riskScoreByProjectId.get(project.getId());

            if (storedScore == null) {
                continue;
            }

            Integer score = storedScore.getScore();

            if (score == null) {
                continue;
            }

            String riskLevel =
                    storedScore.getRiskLevel();

            if (riskLevel == null || riskLevel.isBlank()) {
                riskLevel = calculateRiskLevel(score);
            }

            riskData.add(
                    new ProjectRiskData(
                            project,
                            score,
                            riskLevel,
                            storedScore.getAssessedAt()
                    )
            );
        }

        int totalProjects = projects.size();

        int assessedProjects = riskData.size();

        int low = countRiskLevel(riskData, "LOW");

        int medium = countRiskLevel(riskData, "MEDIUM");

        int high = countRiskLevel(riskData, "HIGH");

        int critical = countRiskLevel(riskData, "CRITICAL");

        double averageRisk =
                riskData.stream()
                        .mapToInt(ProjectRiskData::score)
                        .average()
                        .orElse(0.0);

        /*
         * Current project risk policy:
         *
         * LOW      = 0-30
         * MEDIUM   = 31-60
         * HIGH     = 61-80
         * CRITICAL = 81-100
         *
         * Dashboard "Requires Review" means HIGH or CRITICAL.
         */
        long requiresReview =
                riskData.stream()
                        .filter(x -> x.score >= 61)
                        .count();

        /*
         * The current RiskScore entity stores score/riskLevel/date,
         * but not the detailed reasons from the assessment result.
         *
         * Therefore we do NOT invent an "anomaly detected" count here.
         *
         * We use HIGH + CRITICAL as projects requiring attention,
         * while anomaly-specific evidence remains available on
         * the individual Risk Analysis screen.
         */
        long anomaliesDetected =
                riskData.stream()
                        .filter(x -> x.score >= 61)
                        .count();

        List<AttentionProject> attentionProjects =
                riskData.stream()
                        .filter(x -> x.score >= 61)
                        .sorted(
                                Comparator
                                        .comparingInt(
                                                ProjectRiskData::score
                                        )
                                        .reversed()
                        )
                        .limit(8)
                        .map(this::toAttentionProject)
                        .toList();

        /*
         * Recent assessments are based on the actual assessment
         * timestamp, not project completion date.
         */
        List<RecentAssessment> recentAssessments =
                riskData.stream()
                        .sorted(
                                Comparator.comparing(
                                        ProjectRiskData::assessedAt,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )
                        .limit(6)
                        .map(this::toRecentAssessment)
                        .toList();

        /*
         * Risk trend is grouped by project start year using
         * persisted risk scores.
         */
        List<RiskTrendPoint> riskTrend =
                buildRiskTrend(riskData);

        /*
         * Dashboard insights based only on data actually stored
         * in RiskScore.
         *
         * We deliberately do not fabricate reason counts because
         * RiskScore does not persist the individual reasons.
         */
        List<AIInsight> insights =
                buildInsights(
                        riskData,
                        assessedProjects
                );

        Map<String, List<Long>> riskProjectIds =
                new LinkedHashMap<>();

        riskProjectIds.put(
                "LOW",
                projectIdsFor(riskData, "LOW")
        );

        riskProjectIds.put(
                "MEDIUM",
                projectIdsFor(riskData, "MEDIUM")
        );

        riskProjectIds.put(
                "HIGH",
                projectIdsFor(riskData, "HIGH")
        );

        riskProjectIds.put(
                "CRITICAL",
                projectIdsFor(riskData, "CRITICAL")
        );

        return new DashboardIntelligence(
                totalProjects,
                assessedProjects,
                requiresReview,
                anomaliesDetected,
                roundOne(averageRisk),
                new RiskDistribution(
                        low,
                        medium,
                        high,
                        critical
                ),
                attentionProjects,
                recentAssessments,
                riskTrend,
                insights,
                riskProjectIds
        );
    }

    private int countRiskLevel(
            List<ProjectRiskData> data,
            String level) {

        return (int) data.stream()
                .filter(
                        x -> level.equalsIgnoreCase(
                                x.riskLevel
                        )
                )
                .count();
    }

    private String calculateRiskLevel(
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

    private AttentionProject toAttentionProject(
            ProjectRiskData data) {

        String indicator =
                determinePrimaryIndicator(
                        data.score
                );

        return new AttentionProject(
                data.project.getId(),
                data.project.getProjectCode(),
                data.project.getProjectName(),
                data.score,
                data.riskLevel,
                indicator
        );
    }

    private RecentAssessment toRecentAssessment(
            ProjectRiskData data) {

        return new RecentAssessment(
                data.project.getId(),
                data.project.getProjectCode(),
                data.project.getProjectName(),
                data.score,
                data.riskLevel,
                "Risk assessment recorded"
        );
    }

    private String determinePrimaryIndicator(
            int score) {

        if (score >= 81) {
            return "Critical risk indicator";
        }

        if (score >= 61) {
            return "High risk indicator";
        }

        if (score >= 31) {
            return "Medium risk indicator";
        }

        return "Low risk indicator";
    }

    private List<AIInsight> buildInsights(
            List<ProjectRiskData> riskData,
            int assessedProjects) {

        List<AIInsight> insights =
                new ArrayList<>();

        long highRisk =
                riskData.stream()
                        .filter(x -> x.score >= 61)
                        .count();

        long criticalRisk =
                riskData.stream()
                        .filter(x -> x.score >= 81)
                        .count();

        if (highRisk > 0) {

            insights.add(
                    new AIInsight(
                            "risk",
                            "Projects requiring review",
                            highRisk
                                    + " assessed projects are currently in the high or critical risk range."
                    )
            );
        }

        if (criticalRisk > 0) {

            insights.add(
                    new AIInsight(
                            "critical",
                            "Critical risk indicators",
                            criticalRisk
                                    + " assessed projects currently have a risk score above 80."
                    )
            );
        }

        if (assessedProjects > 0) {

            insights.add(
                    new AIInsight(
                            "coverage",
                            "Assessment coverage",
                            assessedProjects
                                    + " of "
                                    + riskData.size()
                                    + " projects currently have stored risk assessments."
                    )
            );
        }

        if (insights.isEmpty()) {

            insights.add(
                    new AIInsight(
                            "info",
                            "Risk assessment data",
                            "No stored risk assessments are available yet."
                    )
            );
        }

        return insights;
    }

    private List<Long> projectIdsFor(
            List<ProjectRiskData> data,
            String riskLevel) {

        return data.stream()
                .filter(
                        x -> riskLevel.equalsIgnoreCase(
                                x.riskLevel
                        )
                )
                .map(x -> x.project.getId())
                .toList();
    }

    private List<RiskTrendPoint> buildRiskTrend(
            List<ProjectRiskData> data) {

        Map<Integer, List<ProjectRiskData>> grouped =
                data.stream()
                        .filter(
                                x -> x.project.getStartDate() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        x -> x.project
                                                .getStartDate()
                                                .getYear(),
                                        TreeMap::new,
                                        Collectors.toList()
                                )
                        );

        return grouped.entrySet()
                .stream()
                .map(entry -> {

                    double average =
                            entry.getValue()
                                    .stream()
                                    .mapToInt(
                                            ProjectRiskData::score
                                    )
                                    .average()
                                    .orElse(0);

                    return new RiskTrendPoint(
                            String.valueOf(
                                    entry.getKey()
                            ),
                            roundOne(average),
                            entry.getValue().size()
                    );
                })
                .toList();
    }

    private double roundOne(
            double value) {

        return Math.round(
                value * 10.0
        ) / 10.0;
    }

    private record ProjectRiskData(
            Project project,
            int score,
            String riskLevel,
            LocalDateTime assessedAt
    ) {
    }

    public record DashboardIntelligence(
            int totalProjects,
            int assessedProjects,
            long requiresReview,
            long anomaliesDetected,
            double averageRiskScore,
            RiskDistribution riskDistribution,
            List<AttentionProject> attentionProjects,
            List<RecentAssessment> recentAssessments,
            List<RiskTrendPoint> riskTrend,
            List<AIInsight> insights,
            Map<String, List<Long>> riskProjectIds
    ) {
    }

    public record RiskDistribution(
            int low,
            int medium,
            int high,
            int critical
    ) {
    }

    public record AttentionProject(
            Long projectId,
            String projectCode,
            String projectName,
            int riskScore,
            String riskLevel,
            String primaryIndicator
    ) {
    }

    public record RecentAssessment(
            Long projectId,
            String projectCode,
            String projectName,
            int riskScore,
            String riskLevel,
            String activity
    ) {
    }

    public record RiskTrendPoint(
            String year,
            double averageRisk,
            int projectCount
    ) {
    }

    public record AIInsight(
            String type,
            String title,
            String description
    ) {
    }
}