package com.biblioteca.repository;

import com.biblioteca.entity.Resena;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResenaRepository extends MongoRepository<Resena, String> {
    List<Resena> findByLibroId(String libroId);
}