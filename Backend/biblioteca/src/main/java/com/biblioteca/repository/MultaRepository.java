package com.biblioteca.repository;

import com.biblioteca.entity.Multa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MultaRepository extends JpaRepository<Multa, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT SUM(m.total) FROM Multa m WHERE m.pagada = false")
    Double sumPendingFines();

    @org.springframework.data.jpa.repository.Query("SELECT m.prestamo.usuario.nombre, SUM(m.total) as deuda FROM Multa m WHERE m.pagada = false GROUP BY m.prestamo.usuario.nombre ORDER BY deuda DESC")
    List<Object[]> findUsersWithDebt();

    @org.springframework.data.jpa.repository.Query("SELECT m.pagada, SUM(m.total) FROM Multa m GROUP BY m.pagada")
    List<Object[]> findFinesStats();
}
