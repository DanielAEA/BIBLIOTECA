package com.biblioteca.service.impl;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.service.UsuarioService;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @SuppressWarnings("null")
    @Override
    public Usuario crear(@NonNull Usuario usuario) {
        usuario.setId(null);
        // Si no se especifica rol al crear, por defecto es CLIENTE
        if (usuario.getRol() == null || usuario.getRol().isEmpty()) {
            usuario.setRol("CLIENTE");
        }
        if (usuario.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario obtenerPorId(@NonNull String id) {
        return usuarioRepository.findById(Objects.requireNonNull(id)).orElse(null); // test
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @SuppressWarnings("null")
    @Override
    public Usuario actualizar(@NonNull String id, @NonNull Usuario usuario) {
        Usuario existente = usuarioRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getNombre() != null) existente.setNombre(usuario.getNombre());
        if (usuario.getCorreo() != null) existente.setCorreo(usuario.getCorreo());
        
        // PROTECCIÓN DE ROL: Solo actualizar si viene un valor no nulo
        if (usuario.getRol() != null && !usuario.getRol().isEmpty()) {
            existente.setRol(usuario.getRol());
        }
        
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        
        return usuarioRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        usuarioRepository.deleteById(Objects.requireNonNull(id));
    }
}
