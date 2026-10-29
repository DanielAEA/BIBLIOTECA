package com.biblioteca.repository;

import com.biblioteca.entity.Sala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface SalaRepository extends MongoRepository<Sala, String> {
    List<Sala> findByActivaTrue();
    Page<Sala> findByNombreContainingIgnoreCaseOrUbicacionContainingIgnoreCase(String nombre, String ubicacion, Pageable pageable);
    Page<Sala> findByActiva(boolean activa, Pageable pageable);
    Page<Sala> findByActivaAndNombreContainingIgnoreCase(boolean activa, String nombre, Pageable pageable);
}