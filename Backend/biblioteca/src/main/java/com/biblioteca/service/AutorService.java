package com.biblioteca.service;

import com.biblioteca.entity.Autor;
import org.springframework.lang.NonNull;
import java.util.List;

public interface AutorService {
    Autor crear(@NonNull Autor autor);
    Autor obtenerPorId(@NonNull Long id);
    List<Autor> listar();
    Autor actualizar(@NonNull Long id, @NonNull Autor autor);
    void eliminar(@NonNull Long id);
}
