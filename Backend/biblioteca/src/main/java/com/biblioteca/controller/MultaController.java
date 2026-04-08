package com.biblioteca.controller;

import com.biblioteca.entity.Multa;
import com.biblioteca.service.MultaService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/multas")
@CrossOrigin(origins = "*")
public class MultaController {

    private final MultaService multaService;

    public MultaController(MultaService multaService) {
        this.multaService = multaService;
    }

    @GetMapping
    public List<Multa> listar() {
        return multaService.listar();
    }

    @GetMapping("/{id}")
    public Multa obtener(@PathVariable @NonNull String id) {
        return multaService.obtenerPorId(id);
    }

    @PostMapping
    public Multa crear(@RequestBody @NonNull Multa multa) {
        return multaService.crear(multa);
    }

    @PutMapping("/{id}")
    public Multa actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Multa multa) {
        return multaService.actualizar(id, multa);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable @NonNull String id) {
        multaService.eliminar(id);
    }
}
