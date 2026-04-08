package com.biblioteca.controller;

import com.biblioteca.entity.SolicitudPrestamo;
import com.biblioteca.service.SolicitudService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.lang.NonNull;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudController {

    private static final Logger logger = LoggerFactory.getLogger(SolicitudController.class);
    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @PostMapping("/nueva")
    public ResponseEntity<SolicitudPrestamo> nuevaSolicitud(@RequestBody @NonNull SolicitudPrestamo solicitud) {
        return ResponseEntity.ok(solicitudService.crearSolicitud(solicitud));
    }

    @GetMapping
    public ResponseEntity<List<SolicitudPrestamo>> listarSolicitudes(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isEmpty() && !estado.equalsIgnoreCase("Todos")) {
            return ResponseEntity.ok(solicitudService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Object> actualizarEstado(@PathVariable @NonNull String id, @RequestBody @NonNull Map<String, String> body) {
        try {
            String estado = body.get("estado");
            if (estado == null) return ResponseEntity.badRequest().body(Map.of("message", "estado es requerido"));
            return ResponseEntity.ok(solicitudService.actualizarEstado(id, estado));
        } catch (RuntimeException e) {
            logger.error("Error al actualizar estado de solicitud {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
