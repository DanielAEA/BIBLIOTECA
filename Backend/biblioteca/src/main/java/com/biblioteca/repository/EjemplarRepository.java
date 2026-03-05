package com.biblioteca.repository;

import com.biblioteca.entity.Ejemplar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EjemplarRepository extends JpaRepository<Ejemplar, Long> {
}
