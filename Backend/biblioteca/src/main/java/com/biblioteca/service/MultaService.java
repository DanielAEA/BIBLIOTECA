package com.biblioteca.service;

import com.biblioteca.entity.Multa;
import org.springframework.lang.NonNull;
import java.util.List;

public interface MultaService {
    @NonNull Multa crear(@NonNull Multa multa);
    Multa obtenerPorId(@NonNull String id);
    @NonNull List<Multa> listar();
    @NonNull Multa actualizar(@NonNull String id, @NonNull Multa multa);
    void eliminar(@NonNull String id);
}
