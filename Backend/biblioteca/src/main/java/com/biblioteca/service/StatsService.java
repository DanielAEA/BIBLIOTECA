package com.biblioteca.service;

import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
public class StatsService {

    private static final Logger log = LoggerFactory.getLogger(StatsService.class);

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;
    private final MongoTemplate mongoTemplate;

    // Cache con TTL de 3 minutos para máxima velocidad
    private static class CacheEntry {
        final Object data;
        final long timestamp;

        CacheEntry(Object data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired(long ttlMs) {
            return (System.currentTimeMillis() - timestamp) > ttlMs;
        }
    }

    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 180_000; // 3 minutos

    public StatsService(PrestamoRepository prestamoRepository,
                        LibroRepository libroRepository,
                        UsuarioRepository usuarioRepository,
                        MongoTemplate mongoTemplate) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public void clearCache() {
        cache.clear();
        log.info("Caché de estadísticas limpiada.");
    }

    /**
     * Endpoint unificado que devuelve todas las métricas en un único payload,
     * eliminando 11 llamadas HTTP separadas.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getDashboardFull() {
        CacheEntry cached = cache.get("DASHBOARD_FULL");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (Map<String, Object>) cached.data;
        }

        long start = System.currentTimeMillis();
        Map<String, Object> full = new HashMap<>();
        full.put("summary", getSummary());
        full.put("debtors", getUsersWithDebt());
        full.put("expirations", getUpcomingExpirations());
        full.put("books", getMostBorrowedBooks());
        full.put("genres", getLoansByGenre());
        full.put("fines", getFinesStats());
        full.put("authors", getMostBorrowedAuthors());
        full.put("punctuality", getPunctualityRate());
        full.put("trends", getLoansByMonth());
        full.put("status", getLoansByStatus());
        full.put("dist", getInventoryDistribution());

        cache.put("DASHBOARD_FULL", new CacheEntry(full));
        log.info("Dashboard completo calculado y cacheado en {} ms", System.currentTimeMillis() - start);
        return full;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getSummary() {
        CacheEntry cached = cache.get("SUMMARY");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (Map<String, Object>) cached.data;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLibros", mongoTemplate.count(new Query(), "libros"));
        summary.put("totalUsuarios", mongoTemplate.count(new Query(), "usuarios"));
        summary.put("prestamosActivos", mongoTemplate.count(new Query(Criteria.where("devuelto").is(false)), "prestamos"));

        // Multas calculadas directamente en MongoDB mediante aggregation
        double totalMultas = 0.0;
        try {
            Aggregation multasAgg = newAggregation(
                    match(Criteria.where("multa.pagada").is(false)),
                    group().sum("multa.total").as("total")
            );
            AggregationResults<Document> multasRes = mongoTemplate.aggregate(multasAgg, "prestamos", Document.class);
            Document multasDoc = multasRes.getUniqueMappedResult();
            if (multasDoc != null && multasDoc.get("total") != null) {
                totalMultas = ((Number) multasDoc.get("total")).doubleValue();
            }
        } catch (Exception e) {
            log.warn("Error calculando multas pendientes en aggregation: {}", e.getMessage());
        }
        summary.put("totalMultasPendientes", totalMultas);

        // Préstamos vencidos con count directo sin transferir documentos
        long vencidos = mongoTemplate.count(
                new Query(Criteria.where("devuelto").is(false).and("fechaDevolucion").lt(LocalDateTime.now())),
                "prestamos"
        );
        summary.put("prestamosVencidos", vencidos);

        // Ejemplares disponibles calculado directamente en MongoDB
        long disponibles = 0L;
        try {
            Aggregation dispAgg = newAggregation(
                    unwind("ejemplares"),
                    match(Criteria.where("ejemplares.disponible").is(true)),
                    count().as("total")
            );
            AggregationResults<Document> dispRes = mongoTemplate.aggregate(dispAgg, "libros", Document.class);
            Document dispDoc = dispRes.getUniqueMappedResult();
            if (dispDoc != null && dispDoc.get("total") != null) {
                disponibles = ((Number) dispDoc.get("total")).longValue();
            }
        } catch (Exception e) {
            log.warn("Error calculando ejemplares disponibles: {}", e.getMessage());
        }
        summary.put("ejemplaresDisponibles", disponibles);

        LocalDateTime mesAtras = LocalDateTime.now().minusMonths(1);
        long nuevosUsuarios = mongoTemplate.count(
                new Query(Criteria.where("fechaRegistro").gte(mesAtras)),
                "usuarios"
        );
        summary.put("nuevosUsuariosMes", nuevosUsuarios);

        cache.put("SUMMARY", new CacheEntry(summary));
        return summary;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getMostBorrowedBooks() {
        CacheEntry cached = cache.get("MOST_BORROWED");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findMostBorrowedBooks(), "titulo", "total");
        cache.put("MOST_BORROWED", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Long> getInventoryDistribution() {
        CacheEntry cached = cache.get("INVENTORY");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (Map<String, Long>) cached.data;
        }

        Map<String, Long> dist = new HashMap<>();
        dist.put("FISICO", 0L);
        dist.put("DIGITAL", 0L);
        dist.put("AMBOS", 0L);

        try {
            Aggregation agg = newAggregation(
                    group("formato").count().as("total")
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(agg, "libros", Document.class);
            for (Document d : results.getMappedResults()) {
                Object id = d.get("_id");
                Number total = (Number) d.get("total");
                if (id != null && total != null) {
                    dist.put(id.toString(), total.longValue());
                }
            }
        } catch (Exception e) {
            log.warn("Error calculando distribución de inventario: {}", e.getMessage());
        }

        cache.put("INVENTORY", new CacheEntry(dist));
        return dist;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLoansByGenre() {
        CacheEntry cached = cache.get("LOANS_BY_GENRE");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findLoansByGenre(), "genero", "total");
        cache.put("LOANS_BY_GENRE", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLoansByUserRole() {
        CacheEntry cached = cache.get("LOANS_BY_ROLE");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findLoansByUserRole(), "rol", "total");
        cache.put("LOANS_BY_ROLE", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLoansByMonth() {
        CacheEntry cached = cache.get("LOANS_BY_MONTH");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findLoansByMonth(), "mes", "total");
        cache.put("LOANS_BY_MONTH", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getMostBorrowedAuthors() {
        CacheEntry cached = cache.get("MOST_BORROWED_AUTHORS");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findMostBorrowedAuthors(), "autor", "total");
        cache.put("MOST_BORROWED_AUTHORS", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getLoansByStatus() {
        CacheEntry cached = cache.get("LOANS_BY_STATUS");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }
        List<Map<String, Object>> result = mapMongoResults(prestamoRepository.findLoansByStatus(), "estado", "total");
        cache.put("LOANS_BY_STATUS", new CacheEntry(result));
        return result;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getPunctualityRate() {
        CacheEntry cached = cache.get("PUNCTUALITY");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (Map<String, Object>) cached.data;
        }

        long total = mongoTemplate.count(new Query(), "prestamos");
        if (total == 0) {
            Map<String, Object> empty = Map.of("aTiempo", 0L, "atrasados", 0L);
            cache.put("PUNCTUALITY", new CacheEntry(empty));
            return empty;
        }

        // Proyección ligera de solo 2 fechas sin deserializar DBRefs
        Query q = new Query(Criteria.where("devuelto").is(true));
        q.fields().include("fechaDevolucion").include("fechaDevolucionReal");
        List<Document> list = mongoTemplate.find(q, Document.class, "prestamos");

        long atrasados = 0;
        for (Document doc : list) {
            Date fDev = doc.getDate("fechaDevolucion");
            Date fReal = doc.getDate("fechaDevolucionReal");
            if (fDev != null && fReal != null && fReal.after(fDev)) {
                atrasados++;
            }
        }

        Map<String, Object> rate = new HashMap<>();
        rate.put("aTiempo", Math.max(0, total - atrasados));
        rate.put("atrasados", atrasados);

        cache.put("PUNCTUALITY", new CacheEntry(rate));
        return rate;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUsersWithDebt() {
        CacheEntry cached = cache.get("DEBTORS");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }

        List<Map<String, Object>> list = new ArrayList<>();
        try {
            Aggregation agg = newAggregation(
                    match(Criteria.where("multa.pagada").is(false)),
                    lookup("usuarios", "usuario.$id", "_id", "user_doc"),
                    unwind("user_doc", true),
                    lookup("libros", "libro.$id", "_id", "libro_doc"),
                    unwind("libro_doc", true),
                    project()
                            .and("user_doc.nombre").as("usuario")
                            .and("multa.total").as("monto")
                            .and("libro_doc.titulo").as("libro"),
                    limit(15)
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(agg, "prestamos", Document.class);
            for (Document d : results.getMappedResults()) {
                Map<String, Object> map = new HashMap<>();
                map.put("usuario", d.getString("usuario") != null ? d.getString("usuario") : "Usuario");
                map.put("monto", d.get("monto") != null ? d.get("monto") : 0);
                map.put("libro", d.getString("libro") != null ? d.getString("libro") : "N/A");
                list.add(map);
            }
        } catch (Exception e) {
            log.warn("Error consultando deudores en aggregation: {}", e.getMessage());
        }

        cache.put("DEBTORS", new CacheEntry(list));
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getFinesStats() {
        CacheEntry cached = cache.get("FINES_STATS");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }

        List<Map<String, Object>> list = prestamoRepository.findFinesStats().stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            Object id = doc.get("_id");
            map.put("estado", Boolean.TRUE.equals(id) ? "PAGADA" : "PENDIENTE");
            map.put("total", doc.get("total") != null ? doc.get("total") : 0);
            map.put("cantidad", doc.get("cantidad") != null ? doc.get("cantidad") : 0);
            return map;
        }).collect(Collectors.toList());

        cache.put("FINES_STATS", new CacheEntry(list));
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getUpcomingExpirations() {
        CacheEntry cached = cache.get("EXPIRATIONS");
        if (cached != null && !cached.isExpired(CACHE_TTL_MS)) {
            return (List<Map<String, Object>>) cached.data;
        }

        List<Map<String, Object>> list = new ArrayList<>();
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime in3Days = now.plusDays(3);
            Aggregation agg = newAggregation(
                    match(Criteria.where("devuelto").is(false).and("fechaDevolucion").gte(now).lte(in3Days)),
                    lookup("usuarios", "usuario.$id", "_id", "user_doc"),
                    unwind("user_doc", true),
                    lookup("libros", "libro.$id", "_id", "libro_doc"),
                    unwind("libro_doc", true),
                    project()
                            .and("user_doc.nombre").as("usuario")
                            .and("libro_doc.titulo").as("libro")
                            .and("fechaDevolucion").as("vencimiento"),
                    limit(15)
            );
            AggregationResults<Document> results = mongoTemplate.aggregate(agg, "prestamos", Document.class);
            for (Document d : results.getMappedResults()) {
                Map<String, Object> map = new HashMap<>();
                map.put("usuario", d.getString("usuario") != null ? d.getString("usuario") : "Usuario");
                map.put("libro", d.getString("libro") != null ? d.getString("libro") : "N/A");
                map.put("vencimiento", d.get("vencimiento"));
                list.add(map);
            }
        } catch (Exception e) {
            log.warn("Error consultando próximos vencimientos: {}", e.getMessage());
        }

        cache.put("EXPIRATIONS", new CacheEntry(list));
        return list;
    }

    public List<Libro> getInactiveBooks() {
        Query q = new Query(Criteria.where("ejemplares.0").exists(false)).limit(10);
        return mongoTemplate.find(q, Libro.class, "libros");
    }

    private List<Map<String, Object>> mapMongoResults(List<Document> results, String keyName, String valueName) {
        if (results == null) return new ArrayList<>();
        return results.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            Object id = doc.get("_id");
            Object total = doc.get("total");
            map.put(keyName, id != null ? id : "N/A");
            map.put(valueName, total != null ? total : 0);
            return map;
        }).collect(Collectors.toList());
    }
}
