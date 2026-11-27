package com.mplad.mpladrisksystem.repository;

import com.mplad.mpladrisksystem.model.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {

    Optional<RiskScore> findByProjectId(Long projectId);
}