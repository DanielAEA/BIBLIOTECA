package com.biblioteca.controller;

import com.biblioteca.dto.PrestamoDTO;
import com.biblioteca.entity.Libro;
import com.biblioteca.entity.Prestamo;
import com.biblioteca.entity.Usuario;
import com.biblioteca.service.PrestamoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prestamos")
@CrossOrigin(origins = "*")
public class PrestamoController {

    private static final Logger logger = LoggerFactory.getLogger(PrestamoController.class);
    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listar() {
        try {
            List<Map<String, Object>> dtos = prestamoService.listar().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            logger.error("Error al listar préstamos: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private Map<String, Object> mapToDTO(Prestamo p) {
        Map<String, Object> map = new HashMap<>();
        if (p == null) return map;
        
        map.put("id", p.getId());
        map.put("ejemplarCodigo", p.getEjemplarCodigo());
        map.put("tipoPrestamo", p.getTipoPrestamo());
        map.put("fechaPrestamo", p.getFechaPrestamo());
        map.put("fechaDevolucion", p.getFechaDevolucion());
        map.put("fechaDevolucionReal", p.getFechaDevolucionReal());
        map.put("devuelto", p.getDevuelto());
        map.put("estado", p.getEstado());

        if (p.getUsuario() != null) {
            Map<String, Object> uMap = new HashMap<>();
            uMap.put("id", p.getUsuario().getId());
            uMap.put("nombre", p.getUsuario().getNombre());
            uMap.put("correo", p.getUsuario().getCorreo());
            map.put("usuario", uMap);
        }

        if (p.getLibro() != null) {
            Map<String, Object> lMap = new HashMap<>();
            lMap.put("id", p.getLibro().getId());
            lMap.put("titulo", p.getLibro().getTitulo());
            lMap.put("isbn", p.getLibro().getIsbn());
            map.put("libro", lMap);
        }

        if (p.getMulta() != null) {
            Map<String, Object> mMap = new HashMap<>();
            mMap.put("id", p.getMulta().getId());
            mMap.put("total", p.getMulta().getTotal());
            mMap.put("diasAtraso", p.getMulta().getDiasAtraso());
            mMap.put("pagada", p.getMulta().getPagada());
            map.put("multa", mMap);
        }
        return map;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerPorId(@PathVariable @NonNull String id) {
        Prestamo p = prestamoService.obtenerPorId(id);
        return p != null ? ResponseEntity.ok(mapToDTO(p)) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Object> crear(@RequestBody @NonNull PrestamoDTO request) {
        try {
            if (request.getUsuarioId() == null || request.getUsuarioId().isEmpty()) {
                return ResponseEntity.badRequest().body("Usuario ID es requerido");
            }
            if (request.getEjemplarCodigo() == null || request.getEjemplarCodigo().isEmpty()) {
                return ResponseEntity.badRequest().body("Ejemplar código es requerido");
            }

            Prestamo prestamo = new Prestamo();
            Usuario usuario = new Usuario();
            usuario.setId(request.getUsuarioId());
            prestamo.setUsuario(usuario);

            if (request.getLibroId() != null && !request.getLibroId().isEmpty()) {
                Libro libro = new Libro();
                libro.setId(request.getLibroId());
                prestamo.setLibro(libro);
            }

            prestamo.setEjemplarCodigo(request.getEjemplarCodigo());
            prestamo.setFechaPrestamo(request.getFechaPrestamo());
            prestamo.setFechaDevolucion(request.getFechaDevolucion());

            Prestamo guardado = prestamoService.crear(prestamo);
            return ResponseEntity.ok(mapToDTO(guardado));
        } catch (Exception e) {
            logger.error("Error al crear préstamo: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error al crear préstamo: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Prestamo prestamo) {
        try {
            return ResponseEntity.ok(mapToDTO(prestamoService.actualizar(id, prestamo)));
        } catch (Exception e) {
            logger.error("Error al actualizar préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminar(@PathVariable @NonNull String id) {
        try {
            prestamoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error al eliminar préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/devolver")
    public ResponseEntity<Object> devolverLibro(@PathVariable @NonNull String id) {
        try {
            prestamoService.logDebug(">>> RECIBIDA PETICION DE DEVOLUCION PARA ID: " + id);
            Prestamo devuelto = prestamoService.devolverLibro(id);
            return ResponseEntity.ok(mapToDTO(devuelto));
        } catch (Exception e) {
            logger.error("Error al devolver préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/aceptar")
    public ResponseEntity<Object> aceptarSolicitud(@PathVariable @NonNull String id) {
        try {
            return ResponseEntity.ok(mapToDTO(prestamoService.aceptarSolicitud(id)));
        } catch (Exception e) {
            logger.error("Error al aceptar préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Object> rechazarSolicitud(@PathVariable @NonNull String id) {
        try {
            return ResponseEntity.ok(mapToDTO(prestamoService.rechazarSolicitud(id)));
        } catch (Exception e) {
            logger.error("Error al rechazar préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/pagar-multa")
    public ResponseEntity<Object> pagarMulta(@PathVariable @NonNull String id) {
        try {
            return ResponseEntity.ok(mapToDTO(prestamoService.pagarMulta(id)));
        } catch (Exception e) {
            logger.error("Error al cobrar multa del préstamo {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/debug-logs")
    public List<String> getDebugLogs() {
        return prestamoService.getDebugLogs();
    }


    @GetMapping("/usuario/{userId}")
    public List<Map<String, Object>> listarPorUsuario(@PathVariable @NonNull String userId) {
        return prestamoService.listarPorUsuario(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/lectura-virtual")
    public ResponseEntity<Object> registrarLecturaVirtual(@RequestBody @NonNull Map<String, String> request) {
        try {
            String usuarioId = request.get("usuarioId");
            String libroId = request.get("libroId");
            if (usuarioId == null || libroId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "usuarioId y libroId son requeridos"));
            }
            prestamoService.registrarLecturaVirtual(usuarioId, libroId);
            return ResponseEntity.ok(Map.of("message", "Lectura virtual registrada"));
        } catch (RuntimeException e) {
            logger.error("Error en lectura virtual: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
