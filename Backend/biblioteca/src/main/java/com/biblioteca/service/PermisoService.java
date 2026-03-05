package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entity.Permisos;
import org.springframework.lang.NonNull;
import java.util.List;

public interface PermisoService {
    Permisos crear(@NonNull Permisos permiso);
    Permisos obtenerPorId(@NonNull Long id);
    List<Permisos> listar();
    Permisos actualizar(@NonNull Long id, @NonNull Permisos permiso);
    void eliminar(@NonNull Long id);
}
