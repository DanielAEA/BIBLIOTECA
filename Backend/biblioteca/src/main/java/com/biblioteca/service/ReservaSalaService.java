package com.biblioteca.service;

import com.biblioteca.entity.ReservaSala;
import java.time.LocalDate;
import java.util.List;

public interface ReservaSalaService {
    ReservaSala crear(ReservaSala reserva);

    List<ReservaSala> listar();

    List<ReservaSala> listarPorUsuario(Long usuarioId);

    List<ReservaSala> listarPorSala(Long salaId);

    List<ReservaSala> listarPorSalaYFecha(Long salaId, LocalDate fecha);

    ReservaSala obtenerPorId(Long id);

    ReservaSala actualizar(Long id, ReservaSala reserva);

    ReservaSala cambiarEstado(Long id, String estado);

    void eliminar(Long id);
}
