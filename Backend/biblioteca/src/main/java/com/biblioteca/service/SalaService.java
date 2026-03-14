package com.biblioteca.service;

import com.biblioteca.entity.Sala;
import java.util.List;

public interface SalaService {
    Sala crear(Sala sala);

    List<Sala> listar();

    List<Sala> listarActivas();

    Sala obtenerPorId(Long id);

    Sala actualizar(Long id, Sala sala);

    void eliminar(Long id);
}
