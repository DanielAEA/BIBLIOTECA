package com.biblioteca.service;

import com.biblioteca.entity.Prestamo;
import org.springframework.lang.NonNull;
import java.util.List;

public interface PrestamoService {
    Prestamo crear(@NonNull Prestamo prestamo);
    Prestamo obtenerPorId(@NonNull String id);
    List<Prestamo> listar();
    com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> listarPaginado(
            org.springframework.data.domain.Pageable pageable,
            String usuario, String libro, String ejemplarCodigo, String estado, Boolean soloConMulta);
    Prestamo actualizar(@NonNull String id, @NonNull Prestamo prestamo);
    void eliminar(@NonNull String id);
    List<Prestamo> listarPorUsuario(@NonNull String usuarioId);
    com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> listarPorUsuarioPaginado(
            @NonNull String usuarioId, org.springframework.data.domain.Pageable pageable);
    Prestamo devolverLibro(@NonNull String idPrestamo);
    Prestamo aceptarSolicitud(@NonNull String idPrestamo);
    Prestamo rechazarSolicitud(@NonNull String idPrestamo);
    Prestamo pagarMulta(@NonNull String idPrestamo);
    void registrarLecturaVirtual(@NonNull String usuarioId, @NonNull String libroId);
    List<String> getDebugLogs();
    void logDebug(String message);
}
