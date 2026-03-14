package com.biblioteca.controller;

import com.biblioteca.entity.Sala;
import com.biblioteca.service.SalaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@CrossOrigin(origins = "*")
public class SalaController {

    private final SalaService salaService;

    public SalaController(SalaService salaService) {
        this.salaService = salaService;
    }

    @GetMapping
    public List<Sala> listar() {
        return salaService.listar();
    }

    @GetMapping("/activas")
    public List<Sala> listarActivas() {
        return salaService.listarActivas();
    }

    @GetMapping("/{id}")
    public Sala obtener(@PathVariable Long id) {
        return salaService.obtenerPorId(id);
    }

    @PostMapping
    public ResponseEntity<Sala> crear(@RequestBody Sala sala) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaService.crear(sala));
    }

    @PutMapping("/{id}")
    public Sala actualizar(@PathVariable Long id, @RequestBody Sala sala) {
        return salaService.actualizar(id, sala);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        salaService.eliminar(id);
    }
}
