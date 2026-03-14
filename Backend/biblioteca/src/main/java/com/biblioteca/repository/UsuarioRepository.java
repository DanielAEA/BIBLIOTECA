package com.biblioteca.repository;

import com.biblioteca.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Buscar usuario por su dirección de correo electrónico
    Usuario findByCorreo(String correo);

    // Contar usuarios registrados entre dos fechas específicas
    long countByFechaRegistroBetween(LocalDateTime start, LocalDateTime end);
}
