package com.biblioteca.service;

import com.biblioteca.entity.Prestamo;
import org.springframework.lang.NonNull;
import java.util.List;

public interface PrestamoService {
    Prestamo crear(@NonNull Prestamo prestamo);
    Prestamo obtenerPorId(@NonNull String id);
    List<Prestamo> listar();
    Prestamo actualizar(@NonNull String id, @NonNull Prestamo prestamo);
    void eliminar(@NonNull String id);
    List<Prestamo> listarPorUsuario(@NonNull String usuarioId);
    Prestamo devolverLibro(@NonNull String idPrestamo);
    Prestamo aceptarSolicitud(@NonNull String idPrestamo);
    Prestamo rechazarSolicitud(@NonNull String idPrestamo);
    Prestamo pagarMulta(@NonNull String idPrestamo);
    void registrarLecturaVirtual(@NonNull String usuarioId, @NonNull String libroId);
    List<String> getDebugLogs();
    void logDebug(String message);
}
