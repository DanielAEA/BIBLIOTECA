package com.biblioteca.repository;

import com.biblioteca.entity.Prestamo;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface PrestamoRepository extends MongoRepository<Prestamo, String>, PrestamoRepositoryCustom {

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime fecha);

    List<Prestamo> findByUsuarioId(String usuarioId);

    long countByDevueltoFalse();

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBetween(LocalDateTime start, LocalDateTime end);
}
