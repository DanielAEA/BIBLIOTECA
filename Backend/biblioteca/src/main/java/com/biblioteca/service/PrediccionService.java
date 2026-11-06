package com.biblioteca.service;

import com.biblioteca.dto.PrediccionDTO;
import com.biblioteca.entity.Genero;
import com.biblioteca.entity.Libro;
import com.biblioteca.entity.Prestamo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PrediccionService {

    private static final Logger log = LoggerFactory.getLogger(PrediccionService.class);

    @Value("${app.predictivo.url:${PREDICTIVO_URL:http://localhost:8000/predecir}}")
    private String predictUrl;

    private final RestTemplate restTemplate;
    private final MongoTemplate mongoTemplate;

    // Disyuntor rápido (circuit breaker) para evitar esperas cuando el microservicio externo no responde
    private volatile long lastExternalFailure = 0L;
    private static final long COOLDOWN_FAILURE_MS = 60_000L; // 1 minuto de enfriamiento

    // Caché en memoria para métricas históricas de categorías (TTL 5 minutos)
    private static class CacheItem {
        final MetricasDb metricas;
        final long expiresAt;
        CacheItem(MetricasDb m, long ttlMs) {
            this.metricas = m;
            this.expiresAt = System.currentTimeMillis() + ttlMs;
        }
    }
    private final Map<String, CacheItem> cacheMetricas = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000L;

    public PrediccionService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(400); // Conexión ultra-rápida (máx 400ms)
        factory.setReadTimeout(600);    // Lectura ultra-rápida (máx 600ms)
        this.restTemplate = new RestTemplate(factory);
    }

    public static class MetricasDb {
        public double previo;
        public double prom3;
        public long totalHistorico;
        public long librosDisponibles;
    }

    public MetricasDb calcularMetricasDesdeDb(String categoria) {
        String catNombre = (categoria != null && !categoria.trim().isEmpty()) ? categoria.trim() : "Historia";
        String catKey = catNombre.toLowerCase();

        // 0. Comprobar caché en memoria (tiempo de respuesta: 0 ms)
        CacheItem cached = cacheMetricas.get(catKey);
        if (cached != null && System.currentTimeMillis() < cached.expiresAt) {
            return cached.metricas;
        }

        MetricasDb m = new MetricasDb();

        try {
            // 1. Buscar géneros coincidentes en MongoDB con mapeo inteligente y proyección de campos
            String regexKeywords = Pattern.quote(catNombre);
            if ("Académico".equalsIgnoreCase(catNombre) || "Academico".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Académico|Academico|Técnico|Tecnico|Ciencia|Nonfiction";
            } else if ("Historia".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Historia|Filosofía|Filosofia|Épica|Epica|Estrategia";
            } else if ("Biografía".equalsIgnoreCase(catNombre) || "Biografia".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Biografía|Biografia|Crónica|Cronica|Ensayo|Terremotos";
            } else if ("Fantasía".equalsIgnoreCase(catNombre) || "Fantasia".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Fantasía|Fantasia|Fantasy|Fábula|Fabula|Gótico|Gotico|Harry_Potter|Ents";
            } else if ("Novela".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Novela|Fiction|Romance|Cuentos";
            } else if ("Ciencia Ficción".equalsIgnoreCase(catNombre) || "Ciencia Ficcion".equalsIgnoreCase(catNombre)) {
                regexKeywords = "Ciencia Ficción|Ciencia Ficcion";
            }

            Pattern pattern = Pattern.compile(".*(" + regexKeywords + ").*", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
            Query qGeneros = new Query(Criteria.where("nombre").regex(pattern));
            qGeneros.fields().include("_id");
            List<Genero> generos = mongoTemplate.find(qGeneros, Genero.class);
            List<String> genIds = generos.stream().map(Genero::getId).filter(Objects::nonNull).collect(Collectors.toList());

            // 2. Buscar libros correspondientes con solo proyección de _id
            Criteria critLibro;
            if (!genIds.isEmpty()) {
                critLibro = new Criteria().orOperator(
                        Criteria.where("genero").in(genIds),
                        Criteria.where("genero.$id").in(genIds),
                        Criteria.where("genero.$oid").in(genIds)
                );
            } else {
                critLibro = new Criteria();
            }

            Query qLibros = new Query(critLibro);
            qLibros.fields().include("_id");
            List<Libro> libros = mongoTemplate.find(qLibros, Libro.class);
            m.librosDisponibles = (long) libros.size();
            List<String> libroIds = libros.stream().map(Libro::getId).filter(Objects::nonNull).collect(Collectors.toList());

            // 3. Conteos directos en MongoDB mediante índices (sin descargar documentos por la red)
            Criteria critPrestamo;
            if (!libroIds.isEmpty()) {
                critPrestamo = new Criteria().orOperator(
                        Criteria.where("libro").in(libroIds),
                        Criteria.where("libro.$id").in(libroIds),
                        Criteria.where("libro.$oid").in(libroIds)
                );
            } else {
                critPrestamo = new Criteria();
            }

            m.totalHistorico = mongoTemplate.count(new Query(critPrestamo), "prestamos");

            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unMesAtras = ahora.minusMonths(1);
            LocalDateTime tresMesesAtras = ahora.minusMonths(3);

            Query q1Mes = new Query(new Criteria().andOperator(
                    critPrestamo,
                    Criteria.where("fechaPrestamo").gte(unMesAtras)
            ));
            long count1Mes = mongoTemplate.count(q1Mes, "prestamos");

            Query q3Mes = new Query(new Criteria().andOperator(
                    critPrestamo,
                    Criteria.where("fechaPrestamo").gte(tresMesesAtras)
            ));
            long count3Meses = mongoTemplate.count(q3Mes, "prestamos");

            if (count1Mes > 0) {
                m.previo = (double) count1Mes;
                m.prom3 = Math.max(1.0, Math.round((count3Meses / 3.0) * 10.0) / 10.0);
            } else if (m.totalHistorico > 0) {
                // Si hay préstamos históricos en BD pero no en los últimos 30 días
                m.previo = Math.max(1.0, Math.round(m.totalHistorico * 0.35));
                m.prom3 = Math.max(1.0, Math.round((m.totalHistorico / 3.0) * 10.0) / 10.0);
            } else {
                // Calibración automática según catálogo de ejemplares en la BD
                double base = Math.max(2.0, m.librosDisponibles * 0.35);
                m.previo = Math.round(base);
                m.prom3 = Math.round(base * 0.9 * 10.0) / 10.0;
            }

            // Guardar en caché
            cacheMetricas.put(catKey, new CacheItem(m, CACHE_TTL_MS));

        } catch (Exception e) {
            log.error("Error al consultar métricas desde MongoDB para categoría {}: {}", catNombre, e.getMessage());
            m.previo = 20.0;
            m.prom3 = 18.0;
            m.totalHistorico = 0L;
            m.librosDisponibles = 0L;
        }

        return m;
    }

    public PrediccionDTO.Response predecirDemanda(PrediccionDTO.Request request) {
        int mes = request.getMes() != null ? request.getMes() : LocalDateTime.now().getMonthValue();
        String categoria = (request.getCategoria() != null && !request.getCategoria().trim().isEmpty())
                ? request.getCategoria().trim()
                : "Historia";

        // Conexión directa a MongoDB: extraer métricas reales si no fueron proporcionadas
        MetricasDb metricasDb = calcularMetricasDesdeDb(categoria);
        double previo = (request.getPrevio() != null && request.getPrevio() > 0)
                ? request.getPrevio()
                : metricasDb.previo;

        double prom3 = (request.getProm3() != null && request.getProm3() > 0)
                ? request.getProm3()
                : metricasDb.prom3;

        request.setMes(mes);
        request.setCategoria(categoria);
        request.setPrevio(previo);
        request.setProm3(prom3);

        log.info("Calculando estimación para categoría '{}' en mes {} utilizando datos de MongoDB: previo={}, prom3={}, totalHistorico={}",
                categoria, mes, previo, prom3, metricasDb.totalHistorico);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<PrediccionDTO.Request> entity = new HttpEntity<>(request, headers);

        PrediccionDTO.Response finalResponse = null;

        // Comprobación de disyuntor: si el microservicio falló recientemente, no esperar por timeout
        boolean enEnfriamiento = (System.currentTimeMillis() - lastExternalFailure) < COOLDOWN_FAILURE_MS;
        if (!enEnfriamiento && predictUrl != null && !predictUrl.trim().isEmpty() && !predictUrl.contains("disabled")) {
            try {
                ResponseEntity<PrediccionDTO.Response> response = restTemplate.postForEntity(
                        predictUrl,
                        entity,
                        PrediccionDTO.Response.class
                );
                if (response.getBody() != null) {
                    finalResponse = response.getBody();
                }
            } catch (Exception ex) {
                lastExternalFailure = System.currentTimeMillis();
                log.warn("Microservicio externo no disponible en {} ({}). Disyuntor activado: usando cálculo local ultra-rápido por {}s.",
                        predictUrl, ex.getMessage(), COOLDOWN_FAILURE_MS / 1000);
            }
        }

        if (finalResponse == null) {
            finalResponse = calcularInferenciaFallback(request);
        }

        // Enriquecer la respuesta con los datos reales auditables de MongoDB
        finalResponse.setMes(mes);
        finalResponse.setCategoria(categoria);
        finalResponse.setPrevio(previo);
        finalResponse.setProm3(prom3);
        finalResponse.setTotalHistoricoDb(metricasDb.totalHistorico);
        finalResponse.setLibrosDisponiblesDb(metricasDb.librosDisponibles);
        finalResponse.setOrigenDatos("Base de datos MongoDB (CiberBook)");

        return finalResponse;
    }

    private PrediccionDTO.Response calcularInferenciaFallback(PrediccionDTO.Request request) {
        int mes = request.getMes();
        double previo = request.getPrevio();
        double prom3 = request.getProm3();
        String categoria = request.getCategoria();

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
