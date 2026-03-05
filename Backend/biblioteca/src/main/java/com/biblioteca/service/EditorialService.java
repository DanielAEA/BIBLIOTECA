package com.biblioteca.service;

import com.biblioteca.entity.Editorial;
import org.springframework.lang.NonNull;
import java.util.List;

public interface EditorialService {
    Editorial crear(@NonNull Editorial editorial);
    Editorial obtenerPorId(@NonNull Long id);
    List<Editorial> listar();
    Editorial actualizar(@NonNull Long id, @NonNull Editorial editorial);
    void eliminar(@NonNull Long id);
}
