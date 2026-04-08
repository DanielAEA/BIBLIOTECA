package com.biblioteca.repository;

import com.biblioteca.entity.Libro;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LibroRepository extends MongoRepository<Libro, String> {
    long countByFormato(String formato);

    @Query("{ $or: [ { 'ejemplares._id': ?0 }, { 'ejemplares.id': ?0 }, { 'ejemplares.codigo': ?0 } ] }")
    Optional<Libro> findByEjemplarId(String id);
}