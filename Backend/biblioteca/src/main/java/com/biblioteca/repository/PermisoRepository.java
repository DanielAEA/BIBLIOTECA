package com.biblioteca.repository;

import com.biblioteca.entity.Permisos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermisoRepository extends JpaRepository<Permisos, Long> {

}
