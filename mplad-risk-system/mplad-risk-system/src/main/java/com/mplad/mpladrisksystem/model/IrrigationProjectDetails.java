package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "irrigation_project_details")
public class IrrigationProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String irrigationType;
    private Double irrigatedArea;
    private String areaUnit;
    private Double canalLengthKm;
    private Double pipelineLengthKm;
    private Integer beneficiaryCount;
    private Double waterStorageCapacity;
    private String waterSource;
    private Boolean pumpInstalled;
    private Boolean drainageWork;

    public IrrigationProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIrrigationType() {
        return irrigationType;
    }

    public void setIrrigationType(String irrigationType) {
        this.irrigationType = irrigationType;
    }

    public Double getIrrigatedArea() {
        return irrigatedArea;
    }

    public void setIrrigatedArea(Double irrigatedArea) {
        this.irrigatedArea = irrigatedArea;
    }

    public String getAreaUnit() {
        return areaUnit;
    }

    public void setAreaUnit(String areaUnit) {
        this.areaUnit = areaUnit;
    }

    public Double getCanalLengthKm() {
        return canalLengthKm;
    }

    public void setCanalLengthKm(Double canalLengthKm) {
        this.canalLengthKm = canalLengthKm;
    }

    public Double getPipelineLengthKm() {
        return pipelineLengthKm;
    }

    public void setPipelineLengthKm(Double pipelineLengthKm) {
        this.pipelineLengthKm = pipelineLengthKm;
    }

    public Integer getBeneficiaryCount() {
        return beneficiaryCount;
    }

    public void setBeneficiaryCount(Integer beneficiaryCount) {
        this.beneficiaryCount = beneficiaryCount;
    }

    public Double getWaterStorageCapacity() {
        return waterStorageCapacity;
    }

    public void setWaterStorageCapacity(Double waterStorageCapacity) {
        this.waterStorageCapacity = waterStorageCapacity;
    }

    public String getWaterSource() {
        return waterSource;
    }

    public void setWaterSource(String waterSource) {
        this.waterSource = waterSource;
    }

    public Boolean getPumpInstalled() {
        return pumpInstalled;
    }

    public void setPumpInstalled(Boolean pumpInstalled) {
        this.pumpInstalled = pumpInstalled;
    }

    public Boolean getDrainageWork() {
        return drainageWork;
    }

    public void setDrainageWork(Boolean drainageWork) {
        this.drainageWork = drainageWork;
    }
}