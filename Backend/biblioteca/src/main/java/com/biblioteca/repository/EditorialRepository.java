package com.biblioteca.repository;

import com.biblioteca.entity.Editorial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface EditorialRepository extends MongoRepository<Editorial, String> {
    Optional<Editorial> findByNombre(String nombre);
    Page<Editorial> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}