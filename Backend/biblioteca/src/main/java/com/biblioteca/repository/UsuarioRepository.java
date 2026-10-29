package com.biblioteca.repository;

import com.biblioteca.entity.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Usuario findByCorreo(String correo);
    Usuario findByProveedorAndProveedorId(String proveedor, String proveedorId);
    long countByFechaRegistroBetween(LocalDateTime start, LocalDateTime end);
    Page<Usuario> findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase(String nombre, String correo, Pageable pageable);
}