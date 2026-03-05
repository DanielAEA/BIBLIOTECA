package com.biblioteca.service;

import com.biblioteca.entity.Prestamo;
import org.springframework.lang.NonNull;
import java.util.List;

public interface PrestamoService {
    Prestamo crear(@NonNull Prestamo prestamo);
    Prestamo obtenerPorId(@NonNull Long id);
    List<Prestamo> listar();
    Prestamo actualizar(@NonNull Long id, @NonNull Prestamo prestamo);
    void eliminar(@NonNull Long id);

    Prestamo devolverLibro(@NonNull Long idPrestamo);
}
