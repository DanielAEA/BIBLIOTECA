package com.biblioteca.controller;

import com.biblioteca.entity.Autor;
import com.biblioteca.service.AutorService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autores")
@CrossOrigin("*")
public class AutorController {

    private final AutorService autorService;

    public AutorController(AutorService autorService) {
        this.autorService = autorService;
    }

    
    @GetMapping
    public org.springframework.http.ResponseEntity<?> listar(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search) {
        if (page != null) {
            int pageNum = Math.max(0, page);
            int pageSize = (size != null && size > 0) ? Math.min(size, 100) : 10;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    pageNum, pageSize, org.springframework.data.domain.Sort.by("nombre").ascending());
            org.springframework.data.domain.Page<Autor> paginado = autorService.listarPaginado(pageable, search);
            return org.springframework.http.ResponseEntity.ok(com.biblioteca.dto.PageResponse.from(paginado));
        }
        return org.springframework.http.ResponseEntity.ok(autorService.listar());
    }

    @GetMapping("/{id}")
    public Autor obtenerPorId(@PathVariable @NonNull String id) {
        return autorService.obtenerPorId(id);
    }


    @PostMapping
    public Autor crear(@RequestBody @NonNull Autor autor) {
        return autorService.crear(autor);
    }

    @PutMapping("/{id}")
    public Autor actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Autor autor) {
        return autorService.actualizar(id, autor);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable @NonNull String id) {
        autorService.eliminar(id);
    }
}
