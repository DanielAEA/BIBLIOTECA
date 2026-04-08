package com.biblioteca.service.impl;

import com.biblioteca.entity.ReservaSala;
import com.biblioteca.repository.ReservaSalaRepository;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class ReservaSalaServiceImpl implements ReservaSalaService {

    private final ReservaSalaRepository reservaSalaRepository;

    public ReservaSalaServiceImpl(ReservaSalaRepository reservaSalaRepository) {
        this.reservaSalaRepository = reservaSalaRepository;
    }

    @Override
    public ReservaSala crear(@NonNull ReservaSala reserva) {
        reserva.setId(null);
        return reservaSalaRepository.save(reserva);
    }

    @Override
    public ReservaSala obtenerPorId(@NonNull String id) {
        return reservaSalaRepository.findById(id).orElse(null);
    }

    @Override
    public List<ReservaSala> listar() {
        return reservaSalaRepository.findAll();
    }

    @Override
    public List<ReservaSala> listarPorUsuario(@NonNull String usuarioId) {
        return reservaSalaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public List<ReservaSala> listarPorSala(@NonNull String salaId) {
        return reservaSalaRepository.findBySalaId(salaId);
    }

    @Override
    public List<ReservaSala> listarPorSalaYFecha(@NonNull String salaId, @NonNull LocalDate fecha) {
        return reservaSalaRepository.findBySalaIdAndFechaReserva(salaId, fecha);
    }

    @Override
    public ReservaSala actualizar(@NonNull String id, @NonNull ReservaSala reserva) {
        ReservaSala existente = reservaSalaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        existente.setFechaReserva(reserva.getFechaReserva());
        existente.setHoraInicio(reserva.getHoraInicio());
        existente.setHoraFin(reserva.getHoraFin());
        existente.setEstado(reserva.getEstado());
        return reservaSalaRepository.save(existente);
    }

    @Override
    public ReservaSala cambiarEstado(@NonNull String id, @NonNull String estado) {
        ReservaSala existente = reservaSalaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        existente.setEstado(estado);
        return reservaSalaRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        reservaSalaRepository.deleteById(id);
    }
}