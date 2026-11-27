package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "generic_project_details")
public class GenericProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double beneficiaryCount;

    private Double builtUpArea;

    private Double quantity;

    private String quantityUnit;

    public GenericProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getBeneficiaryCount() {
        return beneficiaryCount;
    }

    public void setBeneficiaryCount(Double beneficiaryCount) {
        this.beneficiaryCount = beneficiaryCount;
    }

    public Double getBuiltUpArea() {
        return builtUpArea;
    }

    public void setBuiltUpArea(Double builtUpArea) {
        this.builtUpArea = builtUpArea;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getQuantityUnit() {
        return quantityUnit;
    }

    public void setQuantityUnit(String quantityUnit) {
        this.quantityUnit = quantityUnit;
    }
}