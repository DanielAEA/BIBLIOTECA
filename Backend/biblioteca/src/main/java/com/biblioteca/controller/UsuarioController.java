package com.biblioteca.controller;

import com.biblioteca.dto.UsuarioDTO;
import com.biblioteca.entity.Usuario;
import com.biblioteca.service.UsuarioService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
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
            org.springframework.data.domain.Page<UsuarioDTO> paginado = usuarioService.listarPaginado(pageable, search)
                    .map(this::convertToDTO);
            return org.springframework.http.ResponseEntity.ok(com.biblioteca.dto.PageResponse.from(paginado));
        }
        return org.springframework.http.ResponseEntity.ok(
                usuarioService.listar().stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public UsuarioDTO obtener(@PathVariable @NonNull String id) {
        Usuario usuario = usuarioService.obtenerPorId(id);
        return usuario != null ? convertToDTO(usuario) : null;
    }

    @PostMapping
    public UsuarioDTO crear(@RequestBody @NonNull Usuario usuario) {
        Usuario creado = usuarioService.crear(usuario);
        return convertToDTO(creado);
    }

    @PutMapping("/{id}")
    public UsuarioDTO actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Usuario usuario) {
        Usuario actualizado = usuarioService.actualizar(id, usuario);
        return convertToDTO(actualizado);
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<?> eliminar(@PathVariable(required = false) String id) {
        usuarioService.eliminar(id);
        return org.springframework.http.ResponseEntity.ok().build();
    }

    @DeleteMapping
    public org.springframework.http.ResponseEntity<?> eliminarNulls() {
        usuarioService.eliminar("null");
        return org.springframework.http.ResponseEntity.ok().build();
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        if (usuario == null) return null;
        return new UsuarioDTO(usuario.getId(), usuario.getNombre(), usuario.getCorreo(), usuario.getRol());
    }
}
