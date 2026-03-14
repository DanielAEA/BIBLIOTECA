package com.biblioteca.repository;

import com.biblioteca.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByLibroId(Long libroId);

    List<Resena> findByUsuarioId(Long usuarioId);

    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.libro.id = :libroId")
    Double findPromedioCalificacionByLibroId(Long libroId);

    boolean existsByLibroIdAndUsuarioId(Long libroId, Long usuarioId);
}
