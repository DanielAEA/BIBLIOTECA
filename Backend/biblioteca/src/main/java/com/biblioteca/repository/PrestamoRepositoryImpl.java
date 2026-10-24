package com.biblioteca.repository;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

public class PrestamoRepositoryImpl implements PrestamoRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Document> findMostBorrowedBooks() {
        Aggregation aggregation = newAggregation(
                lookup("libros", "libro.$id", "_id", "libro_doc"),
                unwind("libro_doc", true),
                group("libro_doc.titulo").count().as("total"),
                sort(Sort.Direction.DESC, "total"),
                limit(5));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findLoansByGenre() {
        Aggregation aggregation = newAggregation(
                lookup("libros", "libro.$id", "_id", "libro_doc"),
                unwind("libro_doc", true),
                lookup("generos", "libro_doc.genero", "_id", "gen_doc"),
                unwind("gen_doc", true),
                group("gen_doc.nombre").count().as("total"),
                sort(Sort.Direction.DESC, "total"));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findLoansByUserRole() {
        Aggregation aggregation = newAggregation(
                lookup("usuarios", "usuario.$id", "_id", "usuario_doc"),
                unwind("usuario_doc", true),
                group("usuario_doc.rol").count().as("total"),
                sort(Sort.Direction.DESC, "total"));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findLoansByMonth() {
        Aggregation aggregation = newAggregation(
                project()
                        .andExpression("dateToString('%Y-%m', fechaPrestamo)").as("month"),
                group("month").count().as("total"),
                sort(Sort.Direction.ASC, "_id"));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findMostBorrowedAuthors() {
        Aggregation aggregation = newAggregation(
                lookup("libros", "libro.$id", "_id", "libro_doc"),
                unwind("libro_doc", true),
                unwind("libro_doc.autores", true),
                lookup("autores", "libro_doc.autores", "_id", "aut_doc"),
                unwind("aut_doc", true),
                group("aut_doc.nombre").count().as("total"),
                sort(Sort.Direction.DESC, "total"),
                limit(5));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findFinesStats() {
        Aggregation aggregation = newAggregation(
                match(Criteria.where("multa").exists(true)),
                group("multa.pagada")
                        .sum("multa.total").as("total")
                        .count().as("cantidad"));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public List<Document> findLoansByStatus() {
        Aggregation aggregation = newAggregation(
                group("estado").count().as("total"),
                sort(Sort.Direction.DESC, "total"));
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        return results.getMappedResults();
    }

    @Override
    public com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> findPrestamosPaginados(
            org.springframework.data.domain.Pageable pageable,
            String usuario, String libro, String ejemplarCodigo, String estado, Boolean soloConMulta) {

        java.util.List<org.springframework.data.mongodb.core.aggregation.AggregationOperation> operations = new java.util.ArrayList<>();
        operations.add(lookup("usuarios", "usuario.$id", "_id", "usuario_doc"));
        operations.add(unwind("usuario_doc", true));
        operations.add(lookup("libros", "libro.$id", "_id", "libro_doc"));
        operations.add(unwind("libro_doc", true));

        java.util.List<Criteria> criteriaList = new java.util.ArrayList<>();

        if (usuario != null && !usuario.trim().isEmpty()) {
            String u = usuario.trim();
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("usuario_doc.nombre").regex(u, "i"),
                    Criteria.where("usuario_doc.correo").regex(u, "i")
            ));
        }

        if (libro != null && !libro.trim().isEmpty()) {
            criteriaList.add(Criteria.where("libro_doc.titulo").regex(libro.trim(), "i"));
        }

        if (ejemplarCodigo != null && !ejemplarCodigo.trim().isEmpty()) {
            criteriaList.add(Criteria.where("ejemplarCodigo").regex(ejemplarCodigo.trim(), "i"));
        }

        if (estado != null && !estado.trim().isEmpty()) {
            String est = estado.trim().toLowerCase();
            if ("devuelto".equals(est)) {
                criteriaList.add(Criteria.where("devuelto").is(true));
            } else if ("activo".equals(est)) {
                criteriaList.add(Criteria.where("devuelto").is(false));
            } else {
                criteriaList.add(Criteria.where("estado").regex(est, "i"));
            }
        }

        if (Boolean.TRUE.equals(soloConMulta)) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("multa.pagada").is(false),
                    Criteria.where("devuelto").is(false).and("fechaDevolucion").lt(java.time.LocalDateTime.now())
            ));
        }

        if (!criteriaList.isEmpty()) {
            operations.add(match(new Criteria().andOperator(criteriaList.toArray(new Criteria[0]))));
        }

        operations.add(facet(
                count().as("total")
        ).as("metadata").and(
                sort(Sort.Direction.DESC, "fechaPrestamo").and(Sort.Direction.DESC, "_id"),
                skip(pageable.getOffset()),
                limit(pageable.getPageSize())
        ).as("data"));

        Aggregation aggregation = newAggregation(operations);
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        Document resultDoc = results.getUniqueMappedResult();

        long total = 0;
        java.util.List<java.util.Map<String, Object>> content = new java.util.ArrayList<>();

        if (resultDoc != null) {
            java.util.List<Document> metadata = resultDoc.getList("metadata", Document.class);
            if (metadata != null && !metadata.isEmpty()) {
                Number n = (Number) metadata.get(0).get("total");
                if (n != null) total = n.longValue();
            }

            java.util.List<Document> data = resultDoc.getList("data", Document.class);
            if (data != null) {
                for (Document doc : data) {
                    content.add(mapPrestamoDocumentToMap(doc));
                }
            }
        }

        return com.biblioteca.dto.PageResponse.of(content, pageable.getPageNumber(), pageable.getPageSize(), total);
    }

    @Override
    public com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> findPrestamosPorUsuarioPaginados(
            String usuarioId, org.springframework.data.domain.Pageable pageable) {

        java.util.List<org.springframework.data.mongodb.core.aggregation.AggregationOperation> operations = new java.util.ArrayList<>();

        Criteria userCriteria = new Criteria().orOperator(
                Criteria.where("usuario.$id").is(usuarioId),
                org.bson.types.ObjectId.isValid(usuarioId) ? Criteria.where("usuario.$id").is(new org.bson.types.ObjectId(usuarioId)) : Criteria.where("usuario.$id").is(usuarioId)
        );
        operations.add(match(userCriteria));
        operations.add(lookup("usuarios", "usuario.$id", "_id", "usuario_doc"));
        operations.add(unwind("usuario_doc", true));
        operations.add(lookup("libros", "libro.$id", "_id", "libro_doc"));
        operations.add(unwind("libro_doc", true));

        operations.add(facet(
                count().as("total")
        ).as("metadata").and(
                sort(Sort.Direction.DESC, "fechaPrestamo").and(Sort.Direction.DESC, "_id"),
                skip(pageable.getOffset()),
                limit(pageable.getPageSize())
        ).as("data"));

        Aggregation aggregation = newAggregation(operations);
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "prestamos", Document.class);
        Document resultDoc = results.getUniqueMappedResult();

        long total = 0;
        java.util.List<java.util.Map<String, Object>> content = new java.util.ArrayList<>();

        if (resultDoc != null) {
            java.util.List<Document> metadata = resultDoc.getList("metadata", Document.class);
            if (metadata != null && !metadata.isEmpty()) {
                Number n = (Number) metadata.get(0).get("total");
                if (n != null) total = n.longValue();
            }

            java.util.List<Document> data = resultDoc.getList("data", Document.class);
            if (data != null) {
                for (Document doc : data) {
                    content.add(mapPrestamoDocumentToMap(doc));
                }
            }
        }

        return com.biblioteca.dto.PageResponse.of(content, pageable.getPageNumber(), pageable.getPageSize(), total);
    }

    private java.util.Map<String, Object> mapPrestamoDocumentToMap(Document doc) {
        java.util.Map<String, Object> map = new java.util.HashMap<>();
        if (doc == null) return map;

        Object idObj = doc.get("_id");
        map.put("id", idObj != null ? idObj.toString() : null);
        map.put("ejemplarCodigo", doc.getString("ejemplarCodigo"));
        map.put("tipoPrestamo", doc.getString("tipoPrestamo"));
        map.put("fechaPrestamo", doc.get("fechaPrestamo"));
        map.put("fechaDevolucion", doc.get("fechaDevolucion"));
        map.put("fechaDevolucionReal", doc.get("fechaDevolucionReal"));
        map.put("devuelto", doc.getBoolean("devuelto"));
        map.put("estado", doc.getString("estado"));

        Document uDoc = doc.get("usuario_doc", Document.class);
        if (uDoc != null) {
            java.util.Map<String, Object> uMap = new java.util.HashMap<>();
            Object uid = uDoc.get("_id");
            uMap.put("id", uid != null ? uid.toString() : null);
            uMap.put("nombre", uDoc.getString("nombre"));
            uMap.put("correo", uDoc.getString("correo"));
            map.put("usuario", uMap);
        }

        Document lDoc = doc.get("libro_doc", Document.class);
        if (lDoc != null) {
            java.util.Map<String, Object> lMap = new java.util.HashMap<>();
            Object lid = lDoc.get("_id");
            lMap.put("id", lid != null ? lid.toString() : null);
            lMap.put("titulo", lDoc.getString("titulo"));
            lMap.put("isbn", lDoc.getString("isbn"));
            map.put("libro", lMap);
        }

        Document mDoc = doc.get("multa", Document.class);
        if (mDoc != null) {
            java.util.Map<String, Object> mMap = new java.util.HashMap<>();
            Object mid = mDoc.get("_id");
            mMap.put("id", mid != null ? mid.toString() : null);
            mMap.put("total", mDoc.get("total"));
            mMap.put("diasAtraso", mDoc.get("diasAtraso"));
            mMap.put("pagada", mDoc.get("pagada"));
            map.put("multa", mMap);
        }

        return map;
    }
}
