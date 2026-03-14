package com.biblioteca.service;

import com.biblioteca.entity.Resena;
import java.util.List;

public interface ResenaService {
    Resena crear(Resena resena);

    List<Resena> listar();

    List<Resena> listarPorLibro(Long libroId);

    List<Resena> listarPorUsuario(Long usuarioId);

    Double obtenerPromedioCalificacion(Long libroId);

    Resena obtenerPorId(Long id);

    Resena actualizar(Long id, Resena resena);

    void eliminar(Long id);

    boolean yaReseño(Long libroId, Long usuarioId);
}
