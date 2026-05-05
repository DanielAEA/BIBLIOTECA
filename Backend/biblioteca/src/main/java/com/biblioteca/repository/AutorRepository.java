package com.biblioteca.repository;

import com.biblioteca.entity.Autor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AutorRepository extends MongoRepository<Autor, String> {
    Optional<Autor> findByNombre(String nombre);
}