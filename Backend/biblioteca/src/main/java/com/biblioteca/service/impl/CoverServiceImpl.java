package com.biblioteca.service.impl;

import com.biblioteca.service.CoverService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Objects;

@Service
public class CoverServiceImpl implements CoverService {

    private final RestTemplate restTemplate;

    public CoverServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String fetchCoverByIsbn(String isbn) {
        if (isbn == null || isbn.isBlank()) return null;
        
        String cleanIsbn = isbn.replaceAll("[^0-9X]", "");
        String url = "https://covers.openlibrary.org/b/isbn/" + cleanIsbn + "-L.jpg";
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Sibu/1.0 (Biblioteca App; mailto:admin@sibu.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
            
            byte[] body = response.getBody();
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                
                if (body.length > 1000) {
                    return url;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("[COVER] Error para ISBN " + cleanIsbn + ": " + e.getMessage());
            return null;
        }
    }
}
