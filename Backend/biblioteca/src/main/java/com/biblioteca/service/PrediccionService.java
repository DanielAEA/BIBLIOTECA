package com.biblioteca.service;

import com.biblioteca.dto.PrediccionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class PrediccionService {

    private static final Logger log = LoggerFactory.getLogger(PrediccionService.class);
    private static final String PREDICT_URL = "http://ciberbook-predictivo:8000/predecir";

    private final RestTemplate restTemplate;

    public PrediccionService() {
        this.restTemplate = new RestTemplate();
    }

    public PrediccionDTO.Response predecirDemanda(PrediccionDTO.Request request) {
        log.info("Enviando petici?n de predicci?n a {} para mes {} y categor?a {}", PREDICT_URL, request.getMes(), request.getCategoria());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PrediccionDTO.Request> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<PrediccionDTO.Response> response = restTemplate.postForEntity(
                    PREDICT_URL,
                    entity,
                    PrediccionDTO.Response.class
            );
            return response.getBody();
        } catch (RestClientException ex) {
            log.error("Fallo de comunicaci?n con microservicio predictivo en {}", PREDICT_URL, ex);
            throw new RuntimeException("Error al comunicarse con el microservicio predictivo: " + ex.getMessage(), ex);
        }
    }
}
