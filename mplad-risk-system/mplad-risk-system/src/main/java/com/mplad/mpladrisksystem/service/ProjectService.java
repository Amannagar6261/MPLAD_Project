package com.mplad.mpladrisksystem.service;

import com.mplad.mpladrisksystem.model.Project;
import com.mplad.mpladrisksystem.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    public List<Project> getAllProjects() {

        return projectRepository.findAll();
    }

    // =========================================================
    // GET PROJECT BY ID
    // =========================================================

    public Project getProjectById(Long id) {

        return projectRepository.findById(id)
                .orElse(null);
    }

    // =========================================================
    // SAVE PROJECT
    // =========================================================

    public Project saveProject(Project project) {

        return projectRepository.save(project);
    }

    // =========================================================
    // DELETE PROJECT
    // =========================================================

    public void deleteProject(Long id) {

        projectRepository.deleteById(id);
    }
}