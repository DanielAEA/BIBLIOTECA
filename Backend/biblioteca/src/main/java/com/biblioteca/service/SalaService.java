package com.biblioteca.service;

import com.biblioteca.entity.Sala;
import org.springframework.lang.NonNull;
import java.util.List;

public interface SalaService {
    Sala crear(@NonNull Sala sala);
    Sala obtenerPorId(@NonNull String id);
    List<Sala> listar();
    List<Sala> listarActivas();
    Sala actualizar(@NonNull String id, @NonNull Sala sala);
    void eliminar(@NonNull String id);
}