package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "road_project_details")
public class RoadProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double roadLengthKm;

    private Double roadWidth;

    private String roadType;

    private Boolean shoulderWork;

    private Boolean drainageWork;

    private Integer culvertCount;

    public RoadProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getRoadLengthKm() {
        return roadLengthKm;
    }

    public void setRoadLengthKm(Double roadLengthKm) {
        this.roadLengthKm = roadLengthKm;
    }

    public Double getRoadWidth() {
        return roadWidth;
    }

    public void setRoadWidth(Double roadWidth) {
        this.roadWidth = roadWidth;
    }

    public String getRoadType() {
        return roadType;
    }

    public void setRoadType(String roadType) {
        this.roadType = roadType;
    }

    public Boolean getShoulderWork() {
        return shoulderWork;
    }

    public void setShoulderWork(Boolean shoulderWork) {
        this.shoulderWork = shoulderWork;
    }

    public Boolean getDrainageWork() {
        return drainageWork;
    }

    public void setDrainageWork(Boolean drainageWork) {
        this.drainageWork = drainageWork;
    }

    public Integer getCulvertCount() {
        return culvertCount;
    }

    public void setCulvertCount(Integer culvertCount) {
        this.culvertCount = culvertCount;
    }
}