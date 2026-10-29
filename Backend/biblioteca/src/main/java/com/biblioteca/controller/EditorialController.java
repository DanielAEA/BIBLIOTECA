package com.biblioteca.controller;

import com.biblioteca.entity.Editorial;
import com.biblioteca.service.EditorialService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/editoriales")
@CrossOrigin(origins = "*")
public class EditorialController {

    private final EditorialService editorialService;

    public EditorialController(EditorialService editorialService) {
        this.editorialService = editorialService;
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
            org.springframework.data.domain.Page<Editorial> paginado = editorialService.listarPaginado(pageable, search);
            return org.springframework.http.ResponseEntity.ok(com.biblioteca.dto.PageResponse.from(paginado));
        }
        return org.springframework.http.ResponseEntity.ok(editorialService.listar());
    }

    @GetMapping("/{id}")
    public Editorial obtener(@PathVariable @NonNull String id) {
        return editorialService.obtenerPorId(id);
    }

    @PostMapping
    public Editorial crear(@RequestBody @NonNull Editorial editorial) {
        return editorialService.crear(editorial);
    }

    @PutMapping("/{id}")
    public Editorial actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Editorial editorial) {
        return editorialService.actualizar(id, editorial);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable @NonNull String id) {
        editorialService.eliminar(id);
    }
}
