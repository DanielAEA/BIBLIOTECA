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
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this(usuarioRepository, passwordEncoder, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                              org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.mongoTemplate = mongoTemplate;
    }

    @SuppressWarnings("null")
    @Override
    public Usuario crear(@NonNull Usuario usuario) {
        usuario.setId(null);
        
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
        return usuarioRepository.findById(Objects.requireNonNull(id)).orElse(null); 
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @Override
    public org.springframework.data.domain.Page<Usuario> listarPaginado(org.springframework.data.domain.Pageable pageable, String search) {
        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim();
            return usuarioRepository.findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase(term, term, pageable);
        }
        return usuarioRepository.findAll(pageable);
    }

    @SuppressWarnings("null")
    @Override
    public Usuario actualizar(@NonNull String id, @NonNull Usuario usuario) {
        Usuario existente = usuarioRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getNombre() != null) existente.setNombre(usuario.getNombre());
        if (usuario.getCorreo() != null) existente.setCorreo(usuario.getCorreo());
        
        
        if (usuario.getRol() != null && !usuario.getRol().isEmpty()) {
            existente.setRol(usuario.getRol());
        }
        
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        
        return usuarioRepository.save(existente);
    }

    @Override
    public void eliminar(String id) {
        if (id == null || id.trim().isEmpty() || id.equalsIgnoreCase("null") || id.equalsIgnoreCase("undefined")) {
            if (mongoTemplate != null) {
                mongoTemplate.remove(new org.springframework.data.mongodb.core.query.Query(
                    new org.springframework.data.mongodb.core.query.Criteria().orOperator(
                        org.springframework.data.mongodb.core.query.Criteria.where("_id").is(null),
                        org.springframework.data.mongodb.core.query.Criteria.where("_id").is("null"),
                        org.springframework.data.mongodb.core.query.Criteria.where("correo").is(null),
                        org.springframework.data.mongodb.core.query.Criteria.where("nombre").is(null)
                    )
                ), Usuario.class);
            }
            return;
        }

        try {
            usuarioRepository.deleteById(id);
        } catch (Exception ignored) {
        }

        try {
            if (mongoTemplate != null && org.bson.types.ObjectId.isValid(id)) {
                mongoTemplate.remove(new org.springframework.data.mongodb.core.query.Query(
                    org.springframework.data.mongodb.core.query.Criteria.where("_id").is(new org.bson.types.ObjectId(id))
                ), Usuario.class);
            }
        } catch (Exception ignored) {
        }
    }
}
