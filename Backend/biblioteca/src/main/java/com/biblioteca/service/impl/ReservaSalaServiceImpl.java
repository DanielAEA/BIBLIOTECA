package com.biblioteca.service.impl;

import com.biblioteca.entity.ReservaSala;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.ReservaSalaRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class ReservaSalaServiceImpl implements ReservaSalaService {

    private final ReservaSalaRepository reservaSalaRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaSalaServiceImpl(ReservaSalaRepository reservaSalaRepository, UsuarioRepository usuarioRepository) {
        this.reservaSalaRepository = reservaSalaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public ReservaSala crear(@NonNull ReservaSala reserva) {
        reserva.setId(null);

        if (reserva.getHoraInicio() != null && reserva.getHoraFin() != null) {
            if (!reserva.getHoraInicio().isBefore(reserva.getHoraFin())) {
                throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
            }
        }

        // Validar no solapamiento con reservas existentes para la misma sala y fecha
        if (reserva.getSala() != null && reserva.getSala().getId() != null 
                && reserva.getFechaReserva() != null 
                && reserva.getHoraInicio() != null && reserva.getHoraFin() != null) {
            
            List<ReservaSala> existentes = reservaSalaRepository.findBySalaIdAndFechaReserva(
                    reserva.getSala().getId(), reserva.getFechaReserva());

            for (ReservaSala ex : existentes) {
                if ("CANCELADA".equalsIgnoreCase(ex.getEstado())) {
                    continue;
                }
                if (ex.getHoraInicio() != null && ex.getHoraFin() != null) {
                    boolean solapa = reserva.getHoraInicio().isBefore(ex.getHoraFin()) 
                                  && reserva.getHoraFin().isAfter(ex.getHoraInicio());
                    if (solapa) {
                        throw new IllegalStateException("El horario (" + reserva.getHoraInicio() + " - " 
                                + reserva.getHoraFin() + ") se cruza con una reserva ya existente.");
                    }
                }
            }
        }

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
        List<ReservaSala> list = reservaSalaRepository.findByUsuarioId(usuarioId);
        if (list.isEmpty() && usuarioId.contains("@")) {
            Usuario u = usuarioRepository.findByCorreo(usuarioId);
            if (u != null && u.getId() != null) {
                list.addAll(reservaSalaRepository.findByUsuarioId(u.getId()));
            }
        }
        return list;
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
        if (reserva.getMotivo() != null) {
            existente.setMotivo(reserva.getMotivo());
        }
        if (reserva.getEstado() != null) {
            existente.setEstado(reserva.getEstado());
        }
        return reservaSalaRepository.save(existente);
    }

    @Override
    public ReservaSala cambiarEstado(@NonNull String id, @NonNull String estado) {
        ReservaSala existente = reservaSalaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        existente.setEstado(estado.toUpperCase().trim());
        return reservaSalaRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        reservaSalaRepository.deleteById(id);
    }
}
