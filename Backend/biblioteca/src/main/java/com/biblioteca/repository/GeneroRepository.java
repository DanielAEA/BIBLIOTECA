package com.biblioteca.repository;

import com.biblioteca.entity.Genero;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GeneroRepository extends MongoRepository<Genero, String> {
    Optional<Genero> findByNombre(String nombre);
}