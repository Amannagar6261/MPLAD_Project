package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bridge_project_details")
public class BridgeProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double bridgeLengthMeter;
    private Double bridgeWidthMeter;
    private String bridgeType;
    private String constructionMaterial;
    private Integer spanCount;
    private Boolean approachRoad;
    private Boolean drainageWork;

    public BridgeProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getBridgeLengthMeter() {
        return bridgeLengthMeter;
    }

    public void setBridgeLengthMeter(Double bridgeLengthMeter) {
        this.bridgeLengthMeter = bridgeLengthMeter;
    }

    public Double getBridgeWidthMeter() {
        return bridgeWidthMeter;
    }

    public void setBridgeWidthMeter(Double bridgeWidthMeter) {
        this.bridgeWidthMeter = bridgeWidthMeter;
    }

    public String getBridgeType() {
        return bridgeType;
    }

    public void setBridgeType(String bridgeType) {
        this.bridgeType = bridgeType;
    }

    public String getConstructionMaterial() {
        return constructionMaterial;
    }

    public void setConstructionMaterial(String constructionMaterial) {
        this.constructionMaterial = constructionMaterial;
    }

    public Integer getSpanCount() {
        return spanCount;
    }

    public void setSpanCount(Integer spanCount) {
        this.spanCount = spanCount;
    }

    public Boolean getApproachRoad() {
        return approachRoad;
    }

    public void setApproachRoad(Boolean approachRoad) {
        this.approachRoad = approachRoad;
    }

    public Boolean getDrainageWork() {
        return drainageWork;
    }

    public void setDrainageWork(Boolean drainageWork) {
        this.drainageWork = drainageWork;
    }
}