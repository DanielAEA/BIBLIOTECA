package com.biblioteca.service;

import com.biblioteca.entity.Multa;
import org.springframework.lang.NonNull;
import java.util.List;

public interface MultaService {
    Multa crear(@NonNull Multa multa);
    Multa obtenerPorId(@NonNull Long id);
    List<Multa> listar();
    Multa actualizar(@NonNull Long id, @NonNull Multa multa);
    void eliminar(@NonNull Long id);
}
