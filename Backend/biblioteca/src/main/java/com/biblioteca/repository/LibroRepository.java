package com.biblioteca.repository;

import com.biblioteca.entity.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    long countByFormato(String formato);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM Libro l WHERE l.id NOT IN (SELECT p.ejemplar.libro.id FROM Prestamo p WHERE p.fechaPrestamo > :date)")
    List<Libro> findInactiveBooks(java.time.LocalDateTime date);
}
