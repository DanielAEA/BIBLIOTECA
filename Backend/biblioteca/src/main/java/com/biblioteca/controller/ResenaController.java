package com.biblioteca.controller;

import com.biblioteca.entity.Resena;
import com.biblioteca.service.ResenaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*")
public class ResenaController {

    private final ResenaService resenaService;

    public ResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    @GetMapping
    public List<Resena> listar() {
        return resenaService.listar();
    }

    @GetMapping("/{id}")
    public Resena obtener(@PathVariable Long id) {
        return resenaService.obtenerPorId(id);
    }

    @GetMapping("/libro/{libroId}")
    public List<Resena> listarPorLibro(@PathVariable Long libroId) {
        return resenaService.listarPorLibro(libroId);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Resena> listarPorUsuario(@PathVariable Long usuarioId) {
        return resenaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/libro/{libroId}/promedio")
    public Map<String, Object> obtenerPromedio(@PathVariable Long libroId) {
        Double promedio = resenaService.obtenerPromedioCalificacion(libroId);
        return Map.of(
                "libroId", libroId,
                "promedio", promedio != null ? promedio : 0,
                "totalResenas", resenaService.listarPorLibro(libroId).size());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Resena resena) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.crear(resena));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public Resena actualizar(@PathVariable Long id, @RequestBody Resena resena) {
        return resenaService.actualizar(id, resena);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        resenaService.eliminar(id);
    }
}
