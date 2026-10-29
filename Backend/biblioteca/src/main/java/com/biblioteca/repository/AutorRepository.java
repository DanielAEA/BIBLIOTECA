package com.biblioteca.repository;

import com.biblioteca.entity.Autor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface AutorRepository extends MongoRepository<Autor, String> {
    Optional<Autor> findByNombre(String nombre);
    Page<Autor> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
}