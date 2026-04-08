package com.biblioteca.service;

import com.biblioteca.entity.Ejemplar;
import org.springframework.lang.NonNull;
import java.util.List;

public interface EjemplarService {
    Ejemplar crear(@NonNull Ejemplar ejemplar);
    Ejemplar obtenerPorId(@NonNull String id);
    List<Ejemplar> listar();
    Ejemplar actualizar(@NonNull String id, @NonNull Ejemplar ejemplar);
    void eliminar(@NonNull String id);
}
