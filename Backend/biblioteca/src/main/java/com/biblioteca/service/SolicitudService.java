package com.biblioteca.service;

import com.biblioteca.entity.SolicitudPrestamo;
import org.springframework.lang.NonNull;
import java.util.List;

public interface SolicitudService {
    SolicitudPrestamo crearSolicitud(@NonNull SolicitudPrestamo solicitud);
    List<SolicitudPrestamo> listarTodas();
    List<SolicitudPrestamo> listarPorEstado(@NonNull String estado);
    SolicitudPrestamo actualizarEstado(@NonNull String id, @NonNull String estado);
}
