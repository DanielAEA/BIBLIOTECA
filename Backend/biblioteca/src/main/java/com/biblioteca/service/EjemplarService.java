package com.biblioteca.service;

import com.biblioteca.entity.Ejemplar;
import org.springframework.lang.NonNull;
import java.util.List;

public interface EjemplarService {
    Ejemplar crear(@NonNull Ejemplar ejemplar);
    Ejemplar obtenerPorId(@NonNull Long id);
    List<Ejemplar> listar();
    Ejemplar actualizar(@NonNull Long id, @NonNull Ejemplar ejemplar);
    void eliminar(@NonNull Long id);
}
