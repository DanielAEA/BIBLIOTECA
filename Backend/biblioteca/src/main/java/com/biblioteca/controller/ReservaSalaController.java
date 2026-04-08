package com.biblioteca.controller;

import com.biblioteca.dto.ReservaSalaDTO;
import com.biblioteca.entity.ReservaSala;
import com.biblioteca.entity.Sala;
import com.biblioteca.entity.Usuario;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservas-sala")
@CrossOrigin(origins = "*")
public class ReservaSalaController {

    private final ReservaSalaService reservaSalaService;

    public ReservaSalaController(ReservaSalaService reservaSalaService) {
        this.reservaSalaService = reservaSalaService;
    }

    @GetMapping
    public List<Map<String, Object>> listar() {
        return reservaSalaService.listar().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Map<String, Object> mapToDTO(ReservaSala r) {
        Map<String, Object> map = new HashMap<>();
        if (r == null) return map;
        map.put("id", r.getId());
        map.put("fechaReserva", r.getFechaReserva());
        map.put("horaInicio", r.getHoraInicio());
        map.put("horaFin", r.getHoraFin());
        map.put("motivo", r.getMotivo());
        map.put("estado", r.getEstado());

        if (r.getSala() != null) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("id", r.getSala().getId());
            sMap.put("nombre", r.getSala().getNombre());
            sMap.put("ubicacion", r.getSala().getUbicacion());
            map.put("sala", sMap);
        }

        if (r.getUsuario() != null) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", r.getUsuario().getId());
            uMap.put("nombre", r.getUsuario().getNombre());
            uMap.put("correo", r.getUsuario().getCorreo());
            map.put("usuario", uMap);
        }
        return map;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable @NonNull String id) {
        ReservaSala r = reservaSalaService.obtenerPorId(id);
        return r != null ? ResponseEntity.ok(mapToDTO(r)) : ResponseEntity.notFound().build();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Map<String, Object>> listarPorUsuario(@PathVariable @NonNull String usuarioId) {
        return reservaSalaService.listarPorUsuario(usuarioId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/sala/{salaId}")
    public List<Map<String, Object>> listarPorSala(@PathVariable @NonNull String salaId) {
        return reservaSalaService.listarPorSala(salaId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/sala/{salaId}/fecha/{fecha}")
    public List<Map<String, Object>> listarPorSalaYFecha(
            @PathVariable @NonNull String salaId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) @NonNull LocalDate fecha) {
        return reservaSalaService.listarPorSalaYFecha(salaId, fecha).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody @NonNull ReservaSalaDTO dto) {
        try {
            System.out.println("DEBUG: Recibiendo reserva para sala " + dto.getSalaId() + " usuario " + dto.getUsuarioId());
            
            ReservaSala reserva = new ReservaSala();
            
            Sala sala = new Sala();
            sala.setId(dto.getSalaId());
            reserva.setSala(sala);
            
            Usuario usuario = new Usuario();
            usuario.setId(dto.getUsuarioId());
            reserva.setUsuario(usuario);
            
            reserva.setFechaReserva(dto.getFechaReserva());
            reserva.setHoraInicio(dto.getHoraInicio());
            reserva.setHoraFin(dto.getHoraFin());
            reserva.setMotivo(dto.getMotivo());
            reserva.setEstado("CONFIRMADA"); // Por defecto confirmada al crear por cliente? O pendiente?
            // En el frontend no se especifica, pero segun el componente admin se ve CONFIRMADA
            
            ReservaSala guardada = reservaSalaService.crear(reserva);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(guardada));
        } catch (Exception e) {
            System.err.println("DEBUG ERROR CREAR RESERVA: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error interno al procesar la reserva"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull ReservaSalaDTO dto) {
        try {
            ReservaSala reserva = new ReservaSala();
            reserva.setFechaReserva(dto.getFechaReserva());
            reserva.setHoraInicio(dto.getHoraInicio());
            reserva.setHoraFin(dto.getHoraFin());
            reserva.setMotivo(dto.getMotivo());
            
            return ResponseEntity.ok(mapToDTO(reservaSalaService.actualizar(id, reserva)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable @NonNull String id, @RequestBody @NonNull Map<String, String> body) {
        try {
            String estado = body.get("estado");
            if (estado == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estado' es obligatorio"));
            }
            return ResponseEntity.ok(mapToDTO(reservaSalaService.cambiarEstado(id, estado)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable @NonNull String id) {
        try {
            reservaSalaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
