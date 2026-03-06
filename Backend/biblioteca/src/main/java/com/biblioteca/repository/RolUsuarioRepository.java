package com.biblioteca.repository;

import com.biblioteca.entity.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolUsuarioRepository extends JpaRepository<RolUsuario, Long> {
    java.util.Optional<RolUsuario> findByNombre(String nombre);
}
