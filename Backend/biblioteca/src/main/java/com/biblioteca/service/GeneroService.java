package com.biblioteca.service;

import com.biblioteca.entity.Genero;
import org.springframework.lang.NonNull;
import java.util.List;

public interface GeneroService {
    Genero crear(@NonNull Genero genero);
    Genero obtenerPorId(@NonNull String id);
    List<Genero> listar();
    org.springframework.data.domain.Page<Genero> listarPaginado(org.springframework.data.domain.Pageable pageable, String search);
    Genero actualizar(@NonNull String id, @NonNull Genero genero);
    void eliminar(@NonNull String id);
}