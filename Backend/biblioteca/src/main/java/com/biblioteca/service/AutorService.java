package com.biblioteca.service;

import com.biblioteca.entity.Autor;
import org.springframework.lang.NonNull;
import java.util.List;

public interface AutorService {
    Autor crear(@NonNull Autor autor);
    Autor obtenerPorId(@NonNull String id);
    List<Autor> listar();
    org.springframework.data.domain.Page<Autor> listarPaginado(org.springframework.data.domain.Pageable pageable, String search);
    Autor actualizar(@NonNull String id, @NonNull Autor autor);
    void eliminar(@NonNull String id);
}