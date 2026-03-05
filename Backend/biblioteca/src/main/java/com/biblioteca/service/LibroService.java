package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entity.Libro;
import org.springframework.lang.NonNull;
import java.util.List;

public interface LibroService {
    Libro crear(@NonNull Libro libro);
    Libro obtenerPorId(@NonNull Long id);
    List<Libro> listar();
    Libro actualizar(@NonNull Long id, @NonNull Libro libro);
    void eliminar(@NonNull Long id);
}
