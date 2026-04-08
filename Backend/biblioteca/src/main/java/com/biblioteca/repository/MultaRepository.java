package com.biblioteca.repository;

import com.biblioteca.entity.Multa;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MultaRepository extends MongoRepository<Multa, String> {
}