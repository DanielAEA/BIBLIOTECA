package com.biblioteca.service;

import com.biblioteca.entity.Resena;
import org.springframework.lang.NonNull;
import java.util.List;

public interface ResenaService {
    Resena crear(@NonNull Resena resena);
    Resena obtenerPorId(@NonNull String id);
    List<Resena> listar();
    List<Resena> listarPorLibro(@NonNull String libroId);
    List<Resena> listarPorUsuario(@NonNull String usuarioId);
    Resena actualizar(@NonNull String id, @NonNull Resena resena);
    Double obtenerPromedioCalificacion(@NonNull String libroId);
    void eliminar(@NonNull String id);
}