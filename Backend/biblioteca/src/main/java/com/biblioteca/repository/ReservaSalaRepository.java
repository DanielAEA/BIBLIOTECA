package com.biblioteca.repository;

import com.biblioteca.entity.ReservaSala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaSalaRepository extends MongoRepository<ReservaSala, String> {
    List<ReservaSala> findByUsuarioId(String usuarioId);
    List<ReservaSala> findBySalaId(String salaId);
    List<ReservaSala> findBySalaIdAndFechaReserva(String salaId, LocalDate fechaReserva);
}