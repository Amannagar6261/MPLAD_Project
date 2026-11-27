package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "water_supply_project_details")
public class WaterSupplyProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double capacity;
    private String capacityUnit;
    private String waterSource;
    private String supplyType;
    private Integer beneficiaryCount;
    private Double pipelineLengthKm;
    private Boolean storageTank;
    private Boolean treatmentFacility;

    public WaterSupplyProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getCapacity() {
        return capacity;
    }

    public void setCapacity(Double capacity) {
        this.capacity = capacity;
    }

    public String getCapacityUnit() {
        return capacityUnit;
    }

    public void setCapacityUnit(String capacityUnit) {
        this.capacityUnit = capacityUnit;
    }

    public String getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(String waterSource) {
        this.waterSource = waterSource;
    }

    public String getSupplyType() {
        return supplyType;
    }

    public void setSupplyType(String supplyType) {
        this.supplyType = supplyType;
    }

    public Integer getBeneficiaryCount() {
        return beneficiaryCount;
    }

    public void setBeneficiaryCount(Integer beneficiaryCount) {
        this.beneficiaryCount = beneficiaryCount;
    }

    public Double getPipelineLengthKm() {
        return pipelineLengthKm;
    }

    public void setPipelineLengthKm(Double pipelineLengthKm) {
        this.pipelineLengthKm = pipelineLengthKm;
    }

    public Boolean getStorageTank() {
        return storageTank;
    }

    public void setStorageTank(Boolean storageTank) {
        this.storageTank = storageTank;
    }

    public Boolean getTreatmentFacility() {
        return treatmentFacility;
    }

    public void setTreatmentFacility(Boolean treatmentFacility) {
        this.treatmentFacility = treatmentFacility;
    }
}