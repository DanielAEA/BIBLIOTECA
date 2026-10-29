package com.biblioteca.repository;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.dto.PageResponse;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

public class LibroRepositoryImpl implements LibroRepositoryCustom {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public PageResponse<LibroDTO> findLibrosPaginados(Pageable pageable, String search, String autor, String genero, String bloque, String armario) {
        return findLibrosPaginados(pageable, search, autor, genero, null, null, bloque, armario);
    }

    @Override
    public PageResponse<LibroDTO> findLibrosPaginados(Pageable pageable, String search, String autor, String genero, String editorial, String formato, String bloque, String armario) {
        List<AggregationOperation> operations = new ArrayList<>();

        operations.add(lookup("autores", "autores", "_id", "autores_docs"));
        operations.add(lookup("editoriales", "editorial", "_id", "editorial_docs"));
        operations.add(unwind("editorial_docs", true));
        operations.add(lookup("generos", "genero", "_id", "genero_docs"));
        operations.add(unwind("genero_docs", true));

        List<Criteria> criteriaList = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim();
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("titulo").regex(term, "i"),
                    Criteria.where("codigo").regex(term, "i"),
                    Criteria.where("isbn").regex(term, "i"),
                    Criteria.where("autores_docs.nombre").regex(term, "i"),
                    Criteria.where("genero_docs.nombre").regex(term, "i"),
                    Criteria.where("editorial_docs.nombre").regex(term, "i"),
                    Criteria.where("ejemplares.bloque").regex(term, "i"),
                    Criteria.where("ejemplares.estante").regex(term, "i"),
                    Criteria.where("ejemplares.codigo").regex(term, "i")
            ));
        }

        if (autor != null && !autor.trim().isEmpty()) {
            criteriaList.add(Criteria.where("autores_docs.nombre").regex(autor.trim(), "i"));
        }

        if (genero != null && !genero.trim().isEmpty()) {
            criteriaList.add(Criteria.where("genero_docs.nombre").regex(genero.trim(), "i"));
        }

        if (editorial != null && !editorial.trim().isEmpty()) {
            criteriaList.add(Criteria.where("editorial_docs.nombre").regex(editorial.trim(), "i"));
        }

        if (formato != null && !formato.trim().isEmpty() && !formato.equalsIgnoreCase("TODOS")) {
            criteriaList.add(Criteria.where("formato").is(formato.trim().toUpperCase()));
        }

        if (bloque != null && !bloque.trim().isEmpty()) {
            criteriaList.add(Criteria.where("ejemplares.bloque").regex(bloque.trim(), "i"));
        }

        if (armario != null && !armario.trim().isEmpty()) {
            criteriaList.add(Criteria.where("ejemplares.estante").regex(armario.trim(), "i"));
        }

        if (!criteriaList.isEmpty()) {
            operations.add(match(new Criteria().andOperator(criteriaList.toArray(new Criteria[0]))));
        }

        operations.add(facet(
                count().as("total")
        ).as("metadata").and(
                sort(Sort.Direction.ASC, "titulo").and(Sort.Direction.ASC, "_id"),
                skip(pageable.getOffset()),
                limit(pageable.getPageSize())
        ).as("data"));

        Aggregation aggregation = newAggregation(operations);
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, "libros", Document.class);
        Document resultDoc = results.getUniqueMappedResult();

        long total = 0;
        List<LibroDTO> content = new ArrayList<>();

        if (resultDoc != null) {
            List<Document> metadata = resultDoc.getList("metadata", Document.class);
            if (metadata != null && !metadata.isEmpty()) {
                Number n = (Number) metadata.get(0).get("total");
                if (n != null) total = n.longValue();
            }

            List<Document> data = resultDoc.getList("data", Document.class);
            if (data != null) {
                for (Document doc : data) {
                    content.add(mapLibroDocumentToDTO(doc));
                }
            }
        }

        return PageResponse.of(content, pageable.getPageNumber(), pageable.getPageSize(), total);
    }

    private LibroDTO mapLibroDocumentToDTO(Document doc) {
        if (doc == null) return null;

        Object idObj = doc.get("_id");
        String id = idObj != null ? idObj.toString() : null;

        List<LibroDTO.AutorDTO> autorDTOs = new ArrayList<>();
        List<Document> autoresDocs = doc.getList("autores_docs", Document.class);
        if (autoresDocs != null) {
            for (Document aDoc : autoresDocs) {
                Object aId = aDoc.get("_id");
                autorDTOs.add(new LibroDTO.AutorDTO(aId != null ? aId.toString() : null, aDoc.getString("nombre")));
            }
        }

        LibroDTO.EditorialDTO editorialDTO = null;
        Document eDoc = doc.get("editorial_docs", Document.class);
        if (eDoc != null) {
            Object eId = eDoc.get("_id");
            editorialDTO = new LibroDTO.EditorialDTO(eId != null ? eId.toString() : null, eDoc.getString("nombre"));
        }

        LibroDTO.GeneroDTO generoDTO = null;
        Document gDoc = doc.get("genero_docs", Document.class);
        if (gDoc != null) {
            Object gId = gDoc.get("_id");
            generoDTO = new LibroDTO.GeneroDTO(gId != null ? gId.toString() : null, gDoc.getString("nombre"));
        }

        int stock = 0;
        List<LibroDTO.EjemplarDTO> ejemplarDTOs = new ArrayList<>();
        List<Document> ejDocs = doc.getList("ejemplares", Document.class);
        if (ejDocs != null) {
            for (Document ej : ejDocs) {
                Object ejId = ej.get("id");
                if (ejId == null) ejId = ej.get("_id");
                Boolean disponible = ej.getBoolean("disponible");
                if (Boolean.TRUE.equals(disponible)) {
                    stock++;
                }
                ejemplarDTOs.add(new LibroDTO.EjemplarDTO(
                        ejId != null ? ejId.toString() : null,
                        ej.getString("codigo"),
                        disponible,
                        ej.getString("estado"),
                        ej.getString("bloque"),
                        ej.getString("estante")
                ));
            }
        }

        return new LibroDTO(
                id,
                doc.getString("titulo"),
                autorDTOs,
                editorialDTO,
                generoDTO,
                stock,
                doc.getString("archivoDigital"),
                doc.getBoolean("tieneDigital"),
                doc.getString("formato"),
                doc.getString("isbn"),
                doc.getString("urlPortada"),
                "/api/libros/" + id + "/qr",
                doc.getString("codigo"),
                doc.getString("publicacion"),
                doc.getString("descripcion"),
                ejemplarDTOs
        );
    }
}
