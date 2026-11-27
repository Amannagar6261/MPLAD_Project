package com.mplad.mpladrisksystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "school_project_details")
public class SchoolProjectDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double builtUpArea;

    private Integer classroomCount;

    private Integer labCount;

    private Boolean libraryAvailable;

    private Integer toiletCount;

    private Boolean drinkingWaterAvailable;

    private Boolean boundaryWall;

    public SchoolProjectDetails() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getBuiltUpArea() {
        return builtUpArea;
    }

    public void setBuiltUpArea(Double builtUpArea) {
        this.builtUpArea = builtUpArea;
    }

    public Integer getClassroomCount() {
        return classroomCount;
    }

    public void setClassroomCount(Integer classroomCount) {
        this.classroomCount = classroomCount;
    }

    public Integer getLabCount() {
        return labCount;
    }

    public void setLabCount(Integer labCount) {
        this.labCount = labCount;
    }

    public Boolean getLibraryAvailable() {
        return libraryAvailable;
    }

    public void setLibraryAvailable(Boolean libraryAvailable) {
        this.libraryAvailable = libraryAvailable;
    }

    public Integer getToiletCount() {
        return toiletCount;
    }

    public void setToiletCount(Integer toiletCount) {
        this.toiletCount = toiletCount;
    }

    public Boolean getDrinkingWaterAvailable() {
        return drinkingWaterAvailable;
    }

    public void setDrinkingWaterAvailable(Boolean drinkingWaterAvailable) {
        this.drinkingWaterAvailable = drinkingWaterAvailable;
    }

    public Boolean getBoundaryWall() {
        return boundaryWall;
    }

    public void setBoundaryWall(Boolean boundaryWall) {
        this.boundaryWall = boundaryWall;
    }
}