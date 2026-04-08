package com.biblioteca.service;

import com.biblioteca.entity.ReservaSala;
import org.springframework.lang.NonNull;
import java.time.LocalDate;
import java.util.List;

public interface ReservaSalaService {
    ReservaSala crear(@NonNull ReservaSala reserva);
    ReservaSala obtenerPorId(@NonNull String id);
    List<ReservaSala> listar();
    List<ReservaSala> listarPorUsuario(@NonNull String usuarioId);
    List<ReservaSala> listarPorSala(@NonNull String salaId);
    List<ReservaSala> listarPorSalaYFecha(@NonNull String salaId, @NonNull LocalDate fecha);
    ReservaSala actualizar(@NonNull String id, @NonNull ReservaSala reserva);
    ReservaSala cambiarEstado(@NonNull String id, @NonNull String estado);
    void eliminar(@NonNull String id);
}