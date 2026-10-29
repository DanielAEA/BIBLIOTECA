package com.biblioteca.repository;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface LibroRepositoryCustom {
    PageResponse<LibroDTO> findLibrosPaginados(Pageable pageable, String search, String autor, String genero, String bloque, String armario);
    PageResponse<LibroDTO> findLibrosPaginados(Pageable pageable, String search, String autor, String genero, String editorial, String formato, String bloque, String armario);
}
