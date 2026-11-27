package com.mplad.mpladrisksystem.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class MlRiskService {

    private final RestClient restClient;

    public MlRiskService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    public Map<String, Object> predictRisk(
            double sanctionedAmount,
            double expenditure,
            double expenditureRatio,
            double durationDays,
            double costPerUnit
    ) {

        Map<String, Object> request = Map.of(
                "sanctionedAmount", sanctionedAmount,
                "expenditure", expenditure,
                "expenditureRatio", expenditureRatio,
                "durationDays", durationDays,
                "costPerUnit", costPerUnit
        );

        return restClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Map.class);
    }
}