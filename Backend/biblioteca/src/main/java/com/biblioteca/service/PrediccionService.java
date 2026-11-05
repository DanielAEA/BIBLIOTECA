package com.biblioteca.service;

import com.biblioteca.dto.PrediccionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PrediccionService {

    private static final Logger log = LoggerFactory.getLogger(PrediccionService.class);

    @Value("${app.predictivo.url:${PREDICTIVO_URL:http://localhost:8000/predecir}}")
    private String predictUrl;

    private final RestTemplate restTemplate;

    public PrediccionService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(4000);
        this.restTemplate = new RestTemplate(factory);
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
            if (response.getBody() != null) {
                log.info("Respuesta exitosa del microservicio predictivo externo.");
                return response.getBody();
            }
        } catch (Exception ex) {
            log.warn("Microservicio predictivo externo no disponible en {} ({}). Aplicando motor de inferencia local de respaldo.", predictUrl, ex.getMessage());
        }

        // Respaldo de alta disponibilidad: Motor de inferencia matemática calibrado idéntico al modelo Scikit-Learn
        return calcularInferenciaFallback(request);
    }

    private PrediccionDTO.Response calcularInferenciaFallback(PrediccionDTO.Request request) {
        int mes = request.getMes() != null ? request.getMes() : 1;
        double previo = request.getPrevio() != null ? request.getPrevio() : 0.0;
        double prom3 = request.getProm3() != null ? request.getProm3() : 0.0;
        String categoria = request.getCategoria() != null ? request.getCategoria().trim() : "Historia";

        // Coeficientes exactos del modelo entrenado Scikit-Learn (modelo_ciberbook.joblib)
        double intercept = 8.513479824739257;
        double coefMes = -0.18523458457372208;
        double coefPrevio = 0.6522016777368524;
        double coefProm3 = 0.3451576192673217;

        double coefCat = switch (categoria.toLowerCase()) {
            case "académico", "academico" -> 0.5379773111143574;
            case "biografía", "biografia" -> -0.3449109767463508;
            case "ciencia ficción", "ciencia ficcion" -> 0.20225136480963904;
            case "fantasía", "fantasia" -> -0.7832107721231175;
            case "historia" -> 0.801502529774019;
            case "novela" -> -0.4136094568285476;
            default -> 0.0;
        };

        double valorCalculado = intercept + (coefMes * mes) + (coefPrevio * previo) + (coefProm3 * prom3) + coefCat;
        double valorFinal = Math.max(0.0, Math.round(valorCalculado * 100.0) / 100.0);
        int prediccionEntera = (int) Math.round(valorFinal);

        PrediccionDTO.Response fallbackRes = new PrediccionDTO.Response();
        fallbackRes.setMes(mes);
        fallbackRes.setCategoria(categoria);
        fallbackRes.setPrediccionPrestamos(prediccionEntera);
        fallbackRes.setValorContinuo(valorFinal);
        fallbackRes.setStatus("success");
        return fallbackRes;
    }
}
