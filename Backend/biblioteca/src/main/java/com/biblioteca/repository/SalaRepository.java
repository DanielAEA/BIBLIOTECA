package com.biblioteca.repository;

import com.biblioteca.entity.Sala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaRepository extends MongoRepository<Sala, String> {
    List<Sala> findByActivaTrue();
}