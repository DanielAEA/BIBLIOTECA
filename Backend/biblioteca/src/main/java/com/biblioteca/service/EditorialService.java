package com.biblioteca.service;

import com.biblioteca.entity.Editorial;
import org.springframework.lang.NonNull;
import java.util.List;

public interface EditorialService {
    Editorial crear(@NonNull Editorial editorial);
    Editorial obtenerPorId(@NonNull String id);
    List<Editorial> listar();
    Editorial actualizar(@NonNull String id, @NonNull Editorial editorial);
    void eliminar(@NonNull String id);
}