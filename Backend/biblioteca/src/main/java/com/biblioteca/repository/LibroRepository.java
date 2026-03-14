package com.biblioteca.repository;

import com.biblioteca.entity.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {
    // Contar libros por formato (FISICO, DIGITAL, AMBOS)
    long countByFormato(String formato);

    // Buscar libros que no han tenido préstamos desde una fecha determinada (libros inactivos)
    @org.springframework.data.jpa.repository.Query("SELECT l FROM Libro l WHERE l.id NOT IN (SELECT p.ejemplar.libro.id FROM Prestamo p WHERE p.fechaPrestamo > :date)")
    List<Libro> findInactiveBooks(java.time.LocalDateTime date);
}
