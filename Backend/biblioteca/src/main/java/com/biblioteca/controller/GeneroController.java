package com.biblioteca.controller;

import com.biblioteca.entity.Genero;
import com.biblioteca.service.GeneroService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/generos")
@CrossOrigin(origins = "*")
public class GeneroController {

    private final GeneroService generoService;

    public GeneroController(GeneroService generoService) {
        this.generoService = generoService;
    }

    @GetMapping
    public org.springframework.http.ResponseEntity<?> list(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        if (page != null) {
            int pageNum = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? Math.min(size, 100) : 10;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    pageNum, pageSize, org.springframework.data.domain.Sort.by("nombre").ascending());
            org.springframework.data.domain.Page<Genero> paginado = generoService.listarPaginado(pageable, search);
            return org.springframework.http.ResponseEntity.ok(com.biblioteca.dto.PageResponse.from(paginado));
        }
        return org.springframework.http.ResponseEntity.ok(generoService.listar());
    }

    @GetMapping("/{id}")
    public Genero getById(@PathVariable @NonNull String id) {
        return generoService.obtenerPorId(id);
    }

    @PostMapping
    public Genero create(@RequestBody @NonNull Genero genero) {
        return generoService.crear(genero);
    }

    @PutMapping("/{id}")
    public Genero update(@PathVariable @NonNull String id, @RequestBody @NonNull Genero genero) {
        return generoService.actualizar(id, genero);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull String id) {
        generoService.eliminar(id);
    }
}
