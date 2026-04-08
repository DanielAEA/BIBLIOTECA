package com.biblioteca.repository;

import com.biblioteca.entity.SolicitudPrestamo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends MongoRepository<SolicitudPrestamo, String> {
    List<SolicitudPrestamo> findByEstado(String estado);
}
