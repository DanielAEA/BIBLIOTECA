package com.biblioteca.service;

import com.biblioteca.entity.Libro;
import org.springframework.lang.NonNull;
import java.util.List;

public interface LibroService {
    Libro crear(@NonNull Libro libro);
    Libro obtenerPorId(@NonNull String id);
    List<Libro> listar();
    Libro actualizar(@NonNull String id, @NonNull Libro libro);
    void eliminar(@NonNull String id);
}
