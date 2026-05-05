package com.biblioteca.service.impl;

import com.biblioteca.service.BookMetadataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookMetadataServiceImpl implements BookMetadataService {

    private static final Logger logger = LoggerFactory.getLogger(BookMetadataServiceImpl.class);
    private final RestTemplate restTemplate;
    private static final String OPEN_LIBRARY_API = "https://openlibrary.org/api/books?bibkeys=ISBN:%s&format=json&jscmd=data";
    private static final String GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes?q=isbn:%s";

    public BookMetadataServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Map<String, Object> fetchMetadataByIsbn(String isbn) {
        if (isbn == null || isbn.isBlank())
            return null;
        String cleanIsbn = isbn.replaceAll("[^0-9X]", "");
        logger.info("[METADATA] Buscando metadatos para ISBN: {}", cleanIsbn);

        Map<String, Object> googleData = fetchFromGoogleBooks(cleanIsbn);
        Map<String, Object> olData = fetchFromOpenLibrary(cleanIsbn);

        if (googleData == null && olData == null) {
            logger.warn("[METADATA] No se encontró información en ninguna API para ISBN: {}", cleanIsbn);
            return null;
        }

        Map<String, Object> combined = new HashMap<>();
        if (olData != null)
            combined.putAll(olData);
        if (googleData != null) {
            googleData.forEach((key, value) -> {
                if (value != null)
                    combined.put(key, value);
            });
        }

        combined.put("isbn", cleanIsbn);
        logger.info("[METADATA] Éxito al obtener metadatos para: {}", combined.get("titulo"));
        return combined;
    }

    private Map<String, Object> fetchFromGoogleBooks(String cleanIsbn) {
        String url = String.format(GOOGLE_BOOKS_API, cleanIsbn);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<>() {
            };
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(Objects.requireNonNull(url),
                    Objects.requireNonNull(HttpMethod.GET), entity, Objects.requireNonNull(typeRef));
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && response.get("items") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
                if (!items.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> volumeInfo = (Map<String, Object>) items.get(0).get("volumeInfo");
                    return mapGoogleBooksInfo(volumeInfo, cleanIsbn);
                }
            }
        } catch (Exception e) {
            logger.error("[GOOGLE BOOKS] Error para {}: {}", cleanIsbn, e.getMessage());
        }
        return null;
    }

    private Map<String, Object> fetchFromOpenLibrary(String cleanIsbn) {
        String url = String.format(OPEN_LIBRARY_API, cleanIsbn);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Sibu/1.0 (Biblioteca App; mailto:admin@sibu.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<>() {
            };
            ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(Objects.requireNonNull(url),
                    Objects.requireNonNull(HttpMethod.GET), entity, Objects.requireNonNull(typeRef));
            Map<String, Object> response = responseEntity.getBody();

            String key = "ISBN:" + cleanIsbn;
            if (response != null && response.containsKey(key)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> bookData = (Map<String, Object>) response.get(key);
                return mapOpenLibraryInfo(bookData, cleanIsbn);
            }
        } catch (Exception e) {
            logger.error("[OPEN LIBRARY] Error para {}: {}", cleanIsbn, e.getMessage());
        }
        return null;
    }

    private Map<String, Object> mapGoogleBooksInfo(Map<String, Object> info, String isbn) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("titulo", info.get("title"));
        metadata.put("autores", info.get("authors"));
        metadata.put("editorial", info.get("publisher"));
        metadata.put("publicacion", info.get("publishedDate"));
        metadata.put("descripcion", info.get("description"));

        if (info.containsKey("categories")) {
            @SuppressWarnings("unchecked")
            List<String> categories = (List<String>) info.get("categories");
            if (categories != null && !categories.isEmpty()) {
                metadata.put("genero", categories.get(0));
            }
        }

        if (info.containsKey("imageLinks")) {
            @SuppressWarnings("unchecked")
            Map<String, String> imageLinks = (Map<String, String>) info.get("imageLinks");
            if (imageLinks != null) {
                String cover = imageLinks.get("thumbnail");
                if (cover != null) {
                    
                    metadata.put("urlPortada", cover.replace("http://", "https://").replace("&edge=curl", ""));
                }
            }
        }
        return metadata;
    }

    private Map<String, Object> mapOpenLibraryInfo(Map<String, Object> info, String isbn) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("titulo", info.get("title"));

        if (info.containsKey("authors")) {
            Object authorsObj = info.get("authors");
            if (authorsObj instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, String>> authorsList = (List<Map<String, String>>) authorsObj;
                metadata.put("autores", authorsList.stream().map(a -> a.get("name")).filter(Objects::nonNull)
                        .collect(Collectors.toList()));
            }
        }

        if (info.containsKey("publishers")) {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> publishersList = (List<Map<String, String>>) info.get("publishers");
            if (!publishersList.isEmpty()) {
                metadata.put("editorial", publishersList.get(0).get("name"));
            }
        }

        if (info.containsKey("subjects")) {
            @SuppressWarnings("unchecked")
            List<Map<String, String>> subjectsList = (List<Map<String, String>>) info.get("subjects");
            if (!subjectsList.isEmpty()) {
                metadata.put("genero", subjectsList.get(0).get("name"));
            }
        }

        metadata.put("anio", parseYear(info.get("publish_date")));
        metadata.put("isbn", isbn);

        if (info.containsKey("cover")) {
            @SuppressWarnings("unchecked")
            Map<String, String> covers = (Map<String, String>) info.get("cover");
            if (covers != null) {
                String cover = covers.get("large") != null ? covers.get("large") : covers.get("medium");
                if (cover != null) {
                    metadata.put("urlPortada", cover.replace("http://", "https://"));
                }
            }
        }
        return metadata;
    }

    private Integer parseYear(Object date) {
        if (date == null)
            return null;
        String dateStr = date.toString();
        try {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d{4})").matcher(dateStr);
            if (matcher.find()) {
                return Integer.parseInt(matcher.group(1));
            }
        } catch (Exception e) {
            logger.warn("No se pudo parsear el año de la fecha: {}", dateStr);
        }
        return null;
    }
}
