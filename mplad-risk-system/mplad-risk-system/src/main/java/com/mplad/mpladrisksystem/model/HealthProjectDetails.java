package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "health_project_details")
public class HealthProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String facilityType;
    private Integer bedCount;
    private Double builtUpArea;
    private Integer roomCount;
    private Integer equipmentCount;
    private Integer beneficiaryCount;
    private Boolean electricityAvailable;
    private Boolean drinkingWaterAvailable;
    private Boolean sanitationAvailable;

    public HealthProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }

    public Integer getBedCount() {
        return bedCount;
    }

    public void setBedCount(Integer bedCount) {
        this.bedCount = bedCount;
    }

    public Double getBuiltUpArea() {
        return builtUpArea;
    }

    public void setBuiltUpArea(Double builtUpArea) {
        this.builtUpArea = builtUpArea;
    }

    public Integer getRoomCount() {
        return roomCount;
    }

    public void setRoomCount(Integer roomCount) {
        this.roomCount = roomCount;
    }

    public Integer getEquipmentCount() {
        return equipmentCount;
    }

    public void setEquipmentCount(Integer equipmentCount) {
        this.equipmentCount = equipmentCount;
    }

    public Integer getBeneficiaryCount() {
        return beneficiaryCount;
    }

    public void setBeneficiaryCount(Integer beneficiaryCount) {
        this.beneficiaryCount = beneficiaryCount;
    }

    public Boolean getElectricityAvailable() {
        return electricityAvailable;
    }

    public void setElectricityAvailable(Boolean electricityAvailable) {
        this.electricityAvailable = electricityAvailable;
    }

    public Boolean getDrinkingWaterAvailable() {
        return drinkingWaterAvailable;
    }

    public void setDrinkingWaterAvailable(Boolean drinkingWaterAvailable) {
        this.drinkingWaterAvailable = drinkingWaterAvailable;
    }

    public Boolean getSanitationAvailable() {
        return sanitationAvailable;
    }

    public void setSanitationAvailable(Boolean sanitationAvailable) {
        this.sanitationAvailable = sanitationAvailable;
    }
}