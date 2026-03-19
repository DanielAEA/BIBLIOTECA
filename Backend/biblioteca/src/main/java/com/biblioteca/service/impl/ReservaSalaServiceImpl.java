package com.biblioteca.service.impl;

import com.biblioteca.entity.ReservaSala;
import com.biblioteca.repository.ReservaSalaRepository;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservaSalaServiceImpl implements ReservaSalaService {

    private final ReservaSalaRepository reservaSalaRepository;

    public ReservaSalaServiceImpl(ReservaSalaRepository reservaSalaRepository) {
        this.reservaSalaRepository = reservaSalaRepository;
    }

    @Override
    public ReservaSala crear(ReservaSala reserva) {
        reserva.setId(null);
        LocalTime horaApertura = LocalTime.of(8, 0);
        LocalTime horaCierre = LocalTime.of(19, 0);

        if (reserva.getHoraInicio().isBefore(horaApertura) || reserva.getHoraFin().isAfter(horaCierre)) {
            throw new RuntimeException("El horario permitido para reservas es de 08:00 a 19:00");
        }

        long duracionMinutos = Duration.between(reserva.getHoraInicio(), reserva.getHoraFin()).toMinutes();
        if (duracionMinutos > 60) {
            throw new RuntimeException("La reserva no puede exceder 1 hora de duración");
        }
        if (duracionMinutos < 30) {
            throw new RuntimeException("La reserva debe ser de al menos 30 minutos");
        }

        // Verificar conflictos de horario
        List<ReservaSala> reservasExistentes = reservaSalaRepository
                .findReservasActivasBySalaAndFecha(reserva.getSala().getId(), reserva.getFechaReserva());

        for (ReservaSala existente : reservasExistentes) {
            if (reserva.getHoraInicio().isBefore(existente.getHoraFin())
                    && reserva.getHoraFin().isAfter(existente.getHoraInicio())) {
                throw new RuntimeException("La sala ya está reservada en ese horario");
            }
        }

        reserva.setEstado("CONFIRMADA");
        return reservaSalaRepository.save(reserva);
    }

    @Override
    public List<ReservaSala> listar() {
        return reservaSalaRepository.findAll();
    }

    @Override
    public List<ReservaSala> listarPorUsuario(Long usuarioId) {
        return reservaSalaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public List<ReservaSala> listarPorSala(Long salaId) {
        return reservaSalaRepository.findBySalaId(salaId);
    }

    @Override
    public List<ReservaSala> listarPorSalaYFecha(Long salaId, LocalDate fecha) {
        return reservaSalaRepository.findBySalaIdAndFechaReserva(salaId, fecha);
    }

    @Override
    public ReservaSala obtenerPorId(Long id) {
        return reservaSalaRepository.findById(id).orElse(null);
    }

    @Override
    public ReservaSala actualizar(Long id, ReservaSala reserva) {
        reservaSalaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setId(id);
        return reservaSalaRepository.save(reserva);
    }

    @Override
    public ReservaSala cambiarEstado(Long id, String estado) {
        ReservaSala reserva = reservaSalaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setEstado(estado);
        return reservaSalaRepository.save(reserva);
    }

    @Override
    public void eliminar(Long id) {
        reservaSalaRepository.deleteById(id);
    }
}
