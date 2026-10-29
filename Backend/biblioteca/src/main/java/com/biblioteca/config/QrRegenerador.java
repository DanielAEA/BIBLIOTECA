package com.biblioteca.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class QrRegenerador {

    private static final Logger logger = LoggerFactory.getLogger(QrRegenerador.class);

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @EventListener(ApplicationReadyEvent.class)
    public void regenerarAlIniciar() {
        String urlActiva = baseUrl;
        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(500);
            factory.setReadTimeout(500);
            RestTemplate rt = new RestTemplate(factory);
            String json = rt.getForObject("http://localhost:4040/api/tunnels", String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode tunnels = root.get("tunnels");
            if (tunnels != null) {
                for (JsonNode tunnel : tunnels) {
                    String url = tunnel.get("public_url").asText();
                    if (url.startsWith("https")) {
                        urlActiva = url;
                        break;
                    }
                }
            }
            logger.info("ngrok detectado: {}", urlActiva);
        } catch (Exception e) {
            logger.info("ngrok no detectado, usando: {}", urlActiva);
        }

        logger.info("Base URL activa: {}", urlActiva);
        logger.info("Los QR ahora se generan dinámicamente al ser solicitados.");
    }
}