package com.biblioteca.repository;

import com.biblioteca.entity.Editorial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EditorialRepository extends MongoRepository<Editorial, String> {
}