package com.biblioteca.repository;

import com.biblioteca.entity.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Usuario findByCorreo(String correo);
    long countByFechaRegistroBetween(LocalDateTime start, LocalDateTime end);
}