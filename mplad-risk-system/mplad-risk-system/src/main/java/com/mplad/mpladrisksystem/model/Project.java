package com.mplad.mpladrisksystem.model;

import com.mplad.mpladrisksystem.validation.ValidDateRange;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDate;

@Entity
@Table(name = "projects")
@ValidDateRange
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==============================
    // BASIC PROJECT INFORMATION
    // ==============================

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Project code is required")
    private String projectCode;

    @Column(nullable = false)
    @NotBlank(message = "Project name is required")
    private String projectName;

    private String state;
    private String district;
    private String constituency;
    private String projectType;

    // ==============================
    // FINANCIAL INFORMATION
    // ==============================

    @PositiveOrZero(message = "Sanctioned amount cannot be negative")
    private Double sanctionedAmount;

    @PositiveOrZero(message = "Expenditure cannot be negative")
    private Double expenditure;

    // ==============================
    // PROJECT TIMELINE
    // ==============================

    private LocalDate startDate;
    private LocalDate completionDate;

    // ==============================
    // IMPLEMENTATION INFORMATION
    // ==============================

    private String contractor;
    private String implementingAgency;
    private String status;

    // ==============================
    // SCHOOL PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "school_details_id")
    private SchoolProjectDetails schoolProjectDetails;

    // ==============================
    // ROAD PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "road_details_id")
    private RoadProjectDetails roadProjectDetails;

    // ==============================
    // WATER SUPPLY PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "water_supply_details_id")
    private WaterSupplyProjectDetails waterSupplyProjectDetails;

    // ==============================
    // BRIDGE PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "bridge_details_id")
    private BridgeProjectDetails bridgeProjectDetails;

    // ==============================
    // HEALTH PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "health_details_id")
    private HealthProjectDetails healthProjectDetails;

    // ==============================
    // IRRIGATION PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "irrigation_details_id")
    private IrrigationProjectDetails irrigationProjectDetails;

    // ==============================
    // ELECTRICITY PROJECT DETAILS
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "electricity_details_id")
    private ElectricityProjectDetails electricityProjectDetails;

    // ==============================
    // GENERIC PROJECT DETAILS
    // Used for Sanitation / Community
    // ==============================

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "generic_details_id")
    private GenericProjectDetails genericProjectDetails;

    // ==============================
    // CONSTRUCTOR
    // ==============================

    public Project() {
    }

    // ==============================
    // BASIC GETTERS / SETTERS
    // ==============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProjectCode() {
        return projectCode;
    }

    public void setProjectCode(String projectCode) {
        this.projectCode = projectCode;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getConstituency() {
        return constituency;
    }

    public void setConstituency(String constituency) {
        this.constituency = constituency;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    // ==============================
    // FINANCIAL GETTERS / SETTERS
    // ==============================

    public Double getSanctionedAmount() {
        return sanctionedAmount;
    }

    public void setSanctionedAmount(Double sanctionedAmount) {
        this.sanctionedAmount = sanctionedAmount;
    }

    public Double getExpenditure() {
        return expenditure;
    }

    public void setExpenditure(Double expenditure) {
        this.expenditure = expenditure;
    }

    // ==============================
    // DATE GETTERS / SETTERS
    // ==============================

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    // ==============================
    // IMPLEMENTATION GETTERS / SETTERS
    // ==============================

    public String getContractor() {
        return contractor;
    }

    public void setContractor(String contractor) {
        this.contractor = contractor;
    }

    public String getImplementingAgency() {
        return implementingAgency;
    }

    public void setImplementingAgency(String implementingAgency) {
        this.implementingAgency = implementingAgency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // ==============================
    // SCHOOL GETTER / SETTER
    // ==============================

    public SchoolProjectDetails getSchoolProjectDetails() {
        return schoolProjectDetails;
    }

    public void setSchoolProjectDetails(
            SchoolProjectDetails schoolProjectDetails) {
        this.schoolProjectDetails = schoolProjectDetails;
    }

    // ==============================
    // ROAD GETTER / SETTER
    // ==============================

    public RoadProjectDetails getRoadProjectDetails() {
        return roadProjectDetails;
    }

    public void setRoadProjectDetails(
            RoadProjectDetails roadProjectDetails) {
        this.roadProjectDetails = roadProjectDetails;
    }

    // ==============================
    // WATER SUPPLY GETTER / SETTER
    // ==============================

    public WaterSupplyProjectDetails getWaterSupplyProjectDetails() {
        return waterSupplyProjectDetails;
    }

    public void setWaterSupplyProjectDetails(
            WaterSupplyProjectDetails waterSupplyProjectDetails) {
        this.waterSupplyProjectDetails = waterSupplyProjectDetails;
    }

    // ==============================
    // BRIDGE GETTER / SETTER
    // ==============================

    public BridgeProjectDetails getBridgeProjectDetails() {
        return bridgeProjectDetails;
    }

    public void setBridgeProjectDetails(
            BridgeProjectDetails bridgeProjectDetails) {
        this.bridgeProjectDetails = bridgeProjectDetails;
    }

    // ==============================
    // HEALTH GETTER / SETTER
    // ==============================

    public HealthProjectDetails getHealthProjectDetails() {
        return healthProjectDetails;
    }

    public void setHealthProjectDetails(
            HealthProjectDetails healthProjectDetails) {
        this.healthProjectDetails = healthProjectDetails;
    }

    // ==============================
    // IRRIGATION GETTER / SETTER
    // ==============================

    public IrrigationProjectDetails getIrrigationProjectDetails() {
        return irrigationProjectDetails;
    }

    public void setIrrigationProjectDetails(
            IrrigationProjectDetails irrigationProjectDetails) {
        this.irrigationProjectDetails = irrigationProjectDetails;
    }

    // ==============================
    // ELECTRICITY GETTER / SETTER
    // ==============================

    public ElectricityProjectDetails getElectricityProjectDetails() {
        return electricityProjectDetails;
    }

    public void setElectricityProjectDetails(
            ElectricityProjectDetails electricityProjectDetails) {
        this.electricityProjectDetails = electricityProjectDetails;
    }

    // ==============================
    // GENERIC GETTER / SETTER
    // ==============================

    public GenericProjectDetails getGenericProjectDetails() {
        return genericProjectDetails;
    }

    public void setGenericProjectDetails(
            GenericProjectDetails genericProjectDetails) {
        this.genericProjectDetails = genericProjectDetails;
    }
}