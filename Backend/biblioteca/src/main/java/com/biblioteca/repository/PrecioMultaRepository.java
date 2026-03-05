package com.biblioteca.repository;

import com.biblioteca.entity.PrecioMulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrecioMultaRepository extends JpaRepository<PrecioMulta, Long> {

    PrecioMulta findTopByOrderByVigenteDesdeDesc();
}
 