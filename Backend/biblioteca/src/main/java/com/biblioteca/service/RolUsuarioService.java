package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entity.RolUsuario;
import org.springframework.lang.NonNull;
import java.util.List;

public interface RolUsuarioService {
    RolUsuario crear(@NonNull RolUsuario rol);
    RolUsuario obtenerPorId(@NonNull Long id);
    List<RolUsuario> listar();
    RolUsuario actualizar(@NonNull Long id, @NonNull RolUsuario rol);
    void eliminar(@NonNull Long id);
}

