package com.biblioteca.repository;

import com.biblioteca.entity.ReservaSala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaSalaRepository extends JpaRepository<ReservaSala, Long> {
    List<ReservaSala> findByUsuarioId(Long usuarioId);

    List<ReservaSala> findBySalaId(Long salaId);

    List<ReservaSala> findBySalaIdAndFechaReserva(Long salaId, LocalDate fecha);

    @Query("SELECT r FROM ReservaSala r WHERE r.sala.id = :salaId AND r.fechaReserva = :fecha AND r.estado != 'CANCELADA'")
    List<ReservaSala> findReservasActivasBySalaAndFecha(Long salaId, LocalDate fecha);
}
