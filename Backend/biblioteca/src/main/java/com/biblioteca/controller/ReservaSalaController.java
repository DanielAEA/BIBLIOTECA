package com.biblioteca.controller;

import com.biblioteca.dto.ReservaSalaDTO;
import com.biblioteca.entity.ReservaSala;
import com.biblioteca.entity.Sala;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.SalaRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final SalaRepository salaRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaSalaController(ReservaSalaService reservaSalaService,
                                SalaRepository salaRepository,
                                UsuarioRepository usuarioRepository) {
        this.reservaSalaService = reservaSalaService;
        this.salaRepository = salaRepository;
        this.usuarioRepository = usuarioRepository;
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
        
        String hIni = null;
        if (r.getHoraInicio() != null) {
            hIni = String.format("%02d:%02d", r.getHoraInicio().getHour(), r.getHoraInicio().getMinute());
        }
        String hFin = null;
        if (r.getHoraFin() != null) {
            hFin = String.format("%02d:%02d", r.getHoraFin().getHour(), r.getHoraFin().getMinute());
        }
        map.put("horaInicio", hIni);
        map.put("horaFin", hFin);
        map.put("motivo", r.getMotivo());
        map.put("estado", r.getEstado());

        if (r.getSala() != null) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("id", r.getSala().getId());
            sMap.put("nombre", r.getSala().getNombre());
            sMap.put("ubicacion", r.getSala().getUbicacion());
            sMap.put("capacidad", r.getSala().getCapacidad());
            map.put("sala", sMap);
            map.put("salaId", r.getSala().getId());
        }

        if (r.getUsuario() != null) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", r.getUsuario().getId());
            uMap.put("nombre", r.getUsuario().getNombre());
            uMap.put("correo", r.getUsuario().getCorreo());
            map.put("usuario", uMap);
            map.put("usuarioId", r.getUsuario().getId());
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
    public ResponseEntity<?> crear(@RequestBody @NonNull ReservaSalaDTO dto, Authentication authentication) {
        try {
            String salaId = dto.getSalaId();
            if (salaId == null || salaId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El ID de la sala es obligatorio"));
            }

            Sala sala = salaRepository.findById(salaId)
                    .orElseThrow(() -> new IllegalArgumentException("La sala especificada no existe"));

            if (Boolean.FALSE.equals(sala.getActiva())) {
                return ResponseEntity.badRequest().body(Map.of("error", "La sala se encuentra temporalmente inactiva"));
            }

            Usuario usuario = null;
            String usuarioId = dto.getUsuarioId();
            if (usuarioId != null && !usuarioId.isBlank()) {
                usuario = usuarioRepository.findById(usuarioId).orElse(null);
                if (usuario == null) {
                    usuario = usuarioRepository.findByCorreo(usuarioId);
                }
            }
            if (usuario == null && authentication != null) {
                usuario = usuarioRepository.findByCorreo(authentication.getName());
            }
            if (usuario == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se pudo identificar al usuario de la reserva"));
            }

            if (dto.getFechaReserva() == null || dto.getHoraInicio() == null || dto.getHoraFin() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Fecha, hora de inicio y hora de fin son obligatorias"));
            }

            ReservaSala reserva = new ReservaSala();
            reserva.setSala(sala);
            reserva.setUsuario(usuario);
            reserva.setFechaReserva(dto.getFechaReserva());
            reserva.setHoraInicio(dto.getHoraInicio());
            reserva.setHoraFin(dto.getHoraFin());
            reserva.setMotivo(dto.getMotivo());
            reserva.setEstado("CONFIRMADA");

            ReservaSala guardada = reservaSalaService.crear(reserva);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(guardada));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    public ResponseEntity<?> cambiarEstado(
            @PathVariable @NonNull String id,
            @RequestBody @NonNull Map<String, String> body,
            Authentication authentication) {
        try {
            String estado = body.get("estado");
            if (estado == null || estado.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El campo 'estado' es obligatorio"));
            }

            // Si no es admin, verificar que sea el propietario de la reserva
            boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

            if (!isAdmin && authentication != null) {
                ReservaSala r = reservaSalaService.obtenerPorId(id);
                if (r != null && r.getUsuario() != null) {
                    String currentUser = authentication.getName();
                    boolean isOwner = currentUser.equalsIgnoreCase(r.getUsuario().getCorreo())
                            || currentUser.equals(r.getUsuario().getId());
                    if (!isOwner) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "No tienes permisos para modificar esta reserva"));
                    }
                }
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
