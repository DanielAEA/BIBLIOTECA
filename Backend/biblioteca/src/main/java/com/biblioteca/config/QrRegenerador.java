package com.biblioteca.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class QrRegenerador {

    private static final Logger logger = LoggerFactory.getLogger(QrRegenerador.class);

    @EventListener(ApplicationReadyEvent.class)
    public void regenerarAlIniciar() {
        String ngrokUrl = "http://localhost:8080"; 
        try {
            RestTemplate rt = new RestTemplate();
            String json = rt.getForObject("http://localhost:4040/api/tunnels", String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode tunnels = root.get("tunnels");
            if (tunnels != null) {
                for (JsonNode tunnel : tunnels) {
                    String url = tunnel.get("public_url").asText();
                    if (url.startsWith("https")) {
                        ngrokUrl = url;
                        break;
                    }
                }
            }
            logger.info("ngrok detectado: {}", ngrokUrl);
        } catch (Exception e) {
            logger.info("ngrok no detectado, usando localhost");
        }
        
        logger.info("Los QR ahora se generan dinámicamente al ser solicitados.");
    }
}
