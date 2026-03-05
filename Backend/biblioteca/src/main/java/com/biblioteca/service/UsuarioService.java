package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entity.Usuario;
import org.springframework.lang.NonNull;
import java.util.List;

public interface UsuarioService {
    Usuario crear(@NonNull Usuario usuario);
    Usuario obtenerPorId(@NonNull Long id);
    List<Usuario> listar();
    Usuario actualizar(@NonNull Long id, @NonNull Usuario usuario);
    void eliminar(@NonNull Long id);
}
