package com.biblioteca.service;

import com.biblioteca.entity.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import java.util.List;

public interface UsuarioService {
    Usuario crear(@NonNull Usuario usuario);
    Usuario obtenerPorId(@NonNull String id);
    List<Usuario> listar();
    Page<Usuario> listarPaginado(Pageable pageable, String search);
    Usuario actualizar(@NonNull String id, @NonNull Usuario usuario);
    void eliminar(String id);
}