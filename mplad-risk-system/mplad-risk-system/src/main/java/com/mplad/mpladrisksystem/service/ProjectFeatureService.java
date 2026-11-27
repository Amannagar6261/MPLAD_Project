package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.*;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ProjectFeatureService {

    /**
     * Extracts project-specific measurable features.
     *
     * These features will later be used by:
     * 1. Rule-based risk assessment
     * 2. Similar project comparison
     * 3. ML anomaly detection
     */
    public Map<String, Object> extractFeatures(Project project) {

        Map<String, Object> features = new LinkedHashMap<>();

        if (project == null) {
            return features;
        }

        // ==========================================
        // COMMON PROJECT FEATURES
        // ==========================================

        features.put("projectId", project.getId());
        features.put("projectCode", project.getProjectCode());
        features.put("projectType", project.getProjectType());
        features.put("state", project.getState());
        features.put("district", project.getDistrict());
        features.put("constituency", project.getConstituency());

        features.put(
                "sanctionedAmount",
                project.getSanctionedAmount()
        );

        features.put(
                "expenditure",
                project.getExpenditure()
        );

        features.put(
                "contractor",
                project.getContractor()
        );

        features.put(
                "implementingAgency",
                project.getImplementingAgency()
        );

        features.put(
                "status",
                project.getStatus()
        );

        // ==========================================
        // FINANCIAL FEATURES
        // ==========================================

        if (project.getSanctionedAmount() != null
                && project.getSanctionedAmount() > 0
                && project.getExpenditure() != null) {

            double expenditureRatio =
                    project.getExpenditure()
                            / project.getSanctionedAmount();

            features.put(
                    "expenditureRatio",
                    round(expenditureRatio, 4)
            );

            features.put(
                    "remainingAmount",
                    project.getSanctionedAmount()
                            - project.getExpenditure()
            );
        }

        // ==========================================
        // SCHOOL FEATURES
        // ==========================================

        SchoolProjectDetails school =
                project.getSchoolProjectDetails();

        if (school != null) {

            features.put("builtUpArea",
                    school.getBuiltUpArea());

            features.put("classroomCount",
                    school.getClassroomCount());

            features.put("labCount",
                    school.getLabCount());

            features.put("libraryAvailable",
                    school.getLibraryAvailable());

            features.put("toiletCount",
                    school.getToiletCount());

            features.put("drinkingWaterAvailable",
                    school.getDrinkingWaterAvailable());

            features.put("boundaryWall",
                    school.getBoundaryWall());

            calculateSchoolCostFeatures(
                    project,
                    school,
                    features
            );
        }

        // ==========================================
        // ROAD FEATURES
        // ==========================================

        RoadProjectDetails road =
                project.getRoadProjectDetails();

        if (road != null) {

            features.put("roadLengthKm",
                    road.getRoadLengthKm());

            features.put("roadWidth",
                    road.getRoadWidth());

            features.put("roadType",
                    road.getRoadType());

            features.put("shoulderWork",
                    road.getShoulderWork());

            features.put("drainageWork",
                    road.getDrainageWork());

            features.put("culvertCount",
                    road.getCulvertCount());

            calculateRoadCostFeatures(
                    project,
                    road,
                    features
            );
        }

        // ==========================================
        // WATER SUPPLY FEATURES
        // ==========================================

        WaterSupplyProjectDetails water =
                project.getWaterSupplyProjectDetails();

        if (water != null) {

            features.put("waterCapacity",
                    water.getCapacity());

            features.put("capacityUnit",
                    water.getCapacityUnit());

            features.put("waterSource",
                    water.getWaterSource());

            features.put("supplyType",
                    water.getSupplyType());

            features.put("beneficiaryCount",
                    water.getBeneficiaryCount());

            features.put("pipelineLengthKm",
                    water.getPipelineLengthKm());

            features.put("storageTank",
                    water.getStorageTank());

            features.put("treatmentFacility",
                    water.getTreatmentFacility());

            calculateWaterCostFeatures(
                    project,
                    water,
                    features
            );
        }

        // ==========================================
        // BRIDGE FEATURES
        // ==========================================

        BridgeProjectDetails bridge =
                project.getBridgeProjectDetails();

        if (bridge != null) {

            features.put("bridgeLengthMeter",
                    bridge.getBridgeLengthMeter());

            features.put("bridgeWidthMeter",
                    bridge.getBridgeWidthMeter());

            features.put("bridgeType",
                    bridge.getBridgeType());

            features.put("constructionMaterial",
                    bridge.getConstructionMaterial());

            features.put("spanCount",
                    bridge.getSpanCount());

            features.put("approachRoad",
                    bridge.getApproachRoad());

            features.put("bridgeDrainageWork",
                    bridge.getDrainageWork());

            calculateBridgeCostFeatures(
                    project,
                    bridge,
                    features
            );
        }

        // ==========================================
        // HEALTH FEATURES
        // ==========================================

        HealthProjectDetails health =
                project.getHealthProjectDetails();

        if (health != null) {

            features.put("facilityType",
                    health.getFacilityType());

            features.put("bedCount",
                    health.getBedCount());

            features.put("healthBuiltUpArea",
                    health.getBuiltUpArea());

            features.put("roomCount",
                    health.getRoomCount());

            features.put("equipmentCount",
                    health.getEquipmentCount());

            features.put("healthBeneficiaryCount",
                    health.getBeneficiaryCount());

            features.put("electricityAvailable",
                    health.getElectricityAvailable());

            features.put("healthDrinkingWaterAvailable",
                    health.getDrinkingWaterAvailable());

            features.put("sanitationAvailable",
                    health.getSanitationAvailable());

            calculateHealthCostFeatures(
                    project,
                    health,
                    features
            );
        }

        // ==========================================
        // IRRIGATION FEATURES
        // ==========================================

        IrrigationProjectDetails irrigation =
                project.getIrrigationProjectDetails();

        if (irrigation != null) {

            features.put("irrigationType",
                    irrigation.getIrrigationType());

            features.put("irrigatedArea",
                    irrigation.getIrrigatedArea());

            features.put("areaUnit",
                    irrigation.getAreaUnit());

            features.put("canalLengthKm",
                    irrigation.getCanalLengthKm());

            features.put("irrigationPipelineLengthKm",
                    irrigation.getPipelineLengthKm());

            features.put("irrigationBeneficiaryCount",
                    irrigation.getBeneficiaryCount());

            features.put("waterStorageCapacity",
                    irrigation.getWaterStorageCapacity());

            features.put("irrigationWaterSource",
                    irrigation.getWaterSource());

            features.put("pumpInstalled",
                    irrigation.getPumpInstalled());

            features.put("irrigationDrainageWork",
                    irrigation.getDrainageWork());

            calculateIrrigationCostFeatures(
                    project,
                    irrigation,
                    features
            );
        }

        // ==========================================
        // ELECTRICITY FEATURES
        // ==========================================

        ElectricityProjectDetails electricity =
                project.getElectricityProjectDetails();

        if (electricity != null) {

            features.put("electricityWorkType",
                    electricity.getElectricityWorkType());

            features.put("lineLengthKm",
                    electricity.getLineLengthKm());

            features.put("poleCount",
                    electricity.getPoleCount());

            features.put("transformerCount",
                    electricity.getTransformerCount());

            features.put("transformerCapacityKva",
                    electricity.getTransformerCapacityKva());

            features.put("electricityBeneficiaryCount",
                    electricity.getBeneficiaryCount());

            features.put("streetLighting",
                    electricity.getStreetLighting());

            features.put("solarComponent",
                    electricity.getSolarComponent());

            calculateElectricityCostFeatures(
                    project,
                    electricity,
                    features
            );
        }

        return features;
    }

    // ==========================================
    // SCHOOL COST FEATURES
    // ==========================================

    private void calculateSchoolCostFeatures(
            Project project,
            SchoolProjectDetails school,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (school.getClassroomCount() != null
                && school.getClassroomCount() > 0) {

            double costPerClassroom =
                    project.getSanctionedAmount()
                            / school.getClassroomCount();

            features.put(
                    "costPerClassroom",
                    round(costPerClassroom, 2)
            );
        }

        if (school.getBuiltUpArea() != null
                && school.getBuiltUpArea() > 0) {

            double costPerArea =
                    project.getSanctionedAmount()
                            / school.getBuiltUpArea();

            features.put(
                    "costPerBuiltUpArea",
                    round(costPerArea, 2)
            );
        }
    }

    // ==========================================
    // ROAD COST FEATURES
    // ==========================================

    private void calculateRoadCostFeatures(
            Project project,
            RoadProjectDetails road,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (road.getRoadLengthKm() != null
                && road.getRoadLengthKm() > 0) {

            double costPerKm =
                    project.getSanctionedAmount()
                            / road.getRoadLengthKm();

            features.put(
                    "costPerRoadKm",
                    round(costPerKm, 2)
            );
        }
    }

    // ==========================================
    // WATER COST FEATURES
    // ==========================================

    private void calculateWaterCostFeatures(
            Project project,
            WaterSupplyProjectDetails water,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (water.getBeneficiaryCount() != null
                && water.getBeneficiaryCount() > 0) {

            double costPerBeneficiary =
                    project.getSanctionedAmount()
                            / water.getBeneficiaryCount();

            features.put(
                    "waterCostPerBeneficiary",
                    round(costPerBeneficiary, 2)
            );
        }

        if (water.getPipelineLengthKm() != null
                && water.getPipelineLengthKm() > 0) {

            double costPerKm =
                    project.getSanctionedAmount()
                            / water.getPipelineLengthKm();

            features.put(
                    "waterCostPerPipelineKm",
                    round(costPerKm, 2)
            );
        }
    }

    // ==========================================
    // BRIDGE COST FEATURES
    // ==========================================

    private void calculateBridgeCostFeatures(
            Project project,
            BridgeProjectDetails bridge,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (bridge.getBridgeLengthMeter() != null
                && bridge.getBridgeLengthMeter() > 0) {

            double costPerMeter =
                    project.getSanctionedAmount()
                            / bridge.getBridgeLengthMeter();

            features.put(
                    "costPerBridgeMeter",
                    round(costPerMeter, 2)
            );
        }
    }

    // ==========================================
    // HEALTH COST FEATURES
    // ==========================================

    private void calculateHealthCostFeatures(
            Project project,
            HealthProjectDetails health,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (health.getBedCount() != null
                && health.getBedCount() > 0) {

            double costPerBed =
                    project.getSanctionedAmount()
                            / health.getBedCount();

            features.put(
                    "costPerBed",
                    round(costPerBed, 2)
            );
        }

        if (health.getBeneficiaryCount() != null
                && health.getBeneficiaryCount() > 0) {

            double costPerBeneficiary =
                    project.getSanctionedAmount()
                            / health.getBeneficiaryCount();

            features.put(
                    "healthCostPerBeneficiary",
                    round(costPerBeneficiary, 2)
            );
        }
    }

    // ==========================================
    // IRRIGATION COST FEATURES
    // ==========================================

    private void calculateIrrigationCostFeatures(
            Project project,
            IrrigationProjectDetails irrigation,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (irrigation.getIrrigatedArea() != null
                && irrigation.getIrrigatedArea() > 0) {

            double costPerArea =
                    project.getSanctionedAmount()
                            / irrigation.getIrrigatedArea();

            features.put(
                    "costPerIrrigatedArea",
                    round(costPerArea, 2)
            );
        }

        if (irrigation.getBeneficiaryCount() != null
                && irrigation.getBeneficiaryCount() > 0) {

            double costPerBeneficiary =
                    project.getSanctionedAmount()
                            / irrigation.getBeneficiaryCount();

            features.put(
                    "irrigationCostPerBeneficiary",
                    round(costPerBeneficiary, 2)
            );
        }
    }

    // ==========================================
    // ELECTRICITY COST FEATURES
    // ==========================================

    private void calculateElectricityCostFeatures(
            Project project,
            ElectricityProjectDetails electricity,
            Map<String, Object> features) {

        if (project.getSanctionedAmount() == null) {
            return;
        }

        if (electricity.getLineLengthKm() != null
                && electricity.getLineLengthKm() > 0) {

            double costPerKm =
                    project.getSanctionedAmount()
                            / electricity.getLineLengthKm();

            features.put(
                    "costPerElectricityLineKm",
                    round(costPerKm, 2)
            );
        }

        if (electricity.getPoleCount() != null
                && electricity.getPoleCount() > 0) {

            double costPerPole =
                    project.getSanctionedAmount()
                            / electricity.getPoleCount();

            features.put(
                    "costPerPole",
                    round(costPerPole, 2)
            );
        }

        if (electricity.getBeneficiaryCount() != null
                && electricity.getBeneficiaryCount() > 0) {

            double costPerBeneficiary =
                    project.getSanctionedAmount()
                            / electricity.getBeneficiaryCount();

            features.put(
                    "electricityCostPerBeneficiary",
                    round(costPerBeneficiary, 2)
            );
        }
    }

    // ==========================================
    // ROUNDING HELPER
    // ==========================================

    private double round(double value, int decimalPlaces) {

        double multiplier =
                Math.pow(10, decimalPlaces);

        return Math.round(value * multiplier)
                / multiplier;
    }
}