package com.biblioteca.service;

import com.biblioteca.dto.PrediccionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.predictivo.url:${PREDICTIVO_URL:http://localhost:8000/predecir}}")
    private String predictUrl;

    private final RestTemplate restTemplate;

    public PrediccionService() {
        this.restTemplate = new RestTemplate();
    }

    public PrediccionDTO.Response predecirDemanda(PrediccionDTO.Request request) {
        log.info("Enviando peticion de prediccion a {} para mes {} y categoria {}", predictUrl, request.getMes(), request.getCategoria());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PrediccionDTO.Request> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<PrediccionDTO.Response> response = restTemplate.postForEntity(
                    predictUrl,
                    entity,
                    PrediccionDTO.Response.class
            );
            return response.getBody();
        } catch (RestClientException ex) {
            log.error("Fallo de comunicacion con microservicio predictivo en {}", predictUrl, ex);
            throw new RuntimeException("Error al comunicarse con el microservicio predictivo: " + ex.getMessage(), ex);
        }
    }
}
