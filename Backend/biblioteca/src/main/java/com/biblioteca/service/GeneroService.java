package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entity.Genero;
import org.springframework.lang.NonNull;
import java.util.List;

public interface GeneroService {
    Genero crear(@NonNull Genero genero);
    Genero obtenerPorId(@NonNull Long id);
    List<Genero> listar();
    Genero actualizar(@NonNull Long id, @NonNull Genero genero);
    void eliminar(@NonNull Long id);
}
