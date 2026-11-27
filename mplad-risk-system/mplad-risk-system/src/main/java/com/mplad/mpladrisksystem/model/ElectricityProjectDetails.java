package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "electricity_project_details")
public class ElectricityProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String electricityWorkType;
    private Double lineLengthKm;
    private Integer poleCount;
    private Integer transformerCount;
    private Double transformerCapacityKva;
    private Integer beneficiaryCount;
    private Boolean streetLighting;
    private Boolean solarComponent;

    public ElectricityProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getElectricityWorkType() {
        return electricityWorkType;
    }

    public void setElectricityWorkType(String electricityWorkType) {
        this.electricityWorkType = electricityWorkType;
    }

    public Double getLineLengthKm() {
        return lineLengthKm;
    }

    public void setLineLengthKm(Double lineLengthKm) {
        this.lineLengthKm = lineLengthKm;
    }

    public Integer getPoleCount() {
        return poleCount;
    }

    public void setPoleCount(Integer poleCount) {
        this.poleCount = poleCount;
    }

    public Integer getTransformerCount() {
        return transformerCount;
    }

    public void setTransformerCount(Integer transformerCount) {
        this.transformerCount = transformerCount;
    }

    public Double getTransformerCapacityKva() {
        return transformerCapacityKva;
    }

    public void setTransformerCapacityKva(Double transformerCapacityKva) {
        this.transformerCapacityKva = transformerCapacityKva;
    }

    public Integer getBeneficiaryCount() {
        return beneficiaryCount;
    }

    public void setBeneficiaryCount(Integer beneficiaryCount) {
        this.beneficiaryCount = beneficiaryCount;
    }

    public Boolean getStreetLighting() {
        return streetLighting;
    }

    public void setStreetLighting(Boolean streetLighting) {
        this.streetLighting = streetLighting;
    }

    public Boolean getSolarComponent() {
        return solarComponent;
    }

    public void setSolarComponent(Boolean solarComponent) {
        this.solarComponent = solarComponent;
    }
}