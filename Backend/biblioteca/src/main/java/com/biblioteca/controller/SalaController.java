package com.biblioteca.controller;

import com.biblioteca.entity.Sala;
import com.biblioteca.service.SalaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salas")
@CrossOrigin(origins = "*")
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean activa) {
        if (page != null) {
            int pageNum = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? Math.min(size, 100) : 10;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    pageNum, pageSize, org.springframework.data.domain.Sort.by("nombre").ascending());
            org.springframework.data.domain.Page<Sala> paginado = salaService.listarPaginado(pageable, search, activa);
            return ResponseEntity.ok(com.biblioteca.dto.PageResponse.from(paginado));
        }
        return ResponseEntity.ok(salaService.listar());
    }

    @GetMapping("/activas")
    public List<Sala> listarActivas() {
        return salaService.listarActivas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable @NonNull String id) {
        Sala sala = salaService.obtenerPorId(id);
        return sala != null ? ResponseEntity.ok(sala) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody @NonNull Sala sala) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(salaService.crear(sala));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al crear la sala"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Sala sala) {
        try {
            Sala actualizada = salaService.actualizar(id, sala);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al actualizar la sala"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable @NonNull String id) {
        try {
            salaService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al eliminar la sala"));
        }
    }
}
