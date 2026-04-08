package com.biblioteca.service.impl;

import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.LibroService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class LibroServiceImpl implements LibroService {

    private static final Logger logger = LoggerFactory.getLogger(LibroServiceImpl.class);
    private final LibroRepository libroRepository;

    public LibroServiceImpl(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @Override
    public Libro crear(@NonNull Libro libro) {
        libro.setId(null);
        return Objects.requireNonNull(libroRepository.save(libro));
    }

    @Override
    public Libro obtenerPorId(@NonNull String id) {
        logger.info("[DEBUG] Buscando libro para ID: {}", id);
        // Primero intentamos buscar por ID de libro
        Optional<Libro> libro = libroRepository.findById(Objects.requireNonNull(id));
        if (libro.isPresent()) {
            logger.info("[DEBUG] Libro encontrado directamente por ID: {}", libro.get().getTitulo());
            return libro.get();
        }
        
        // Si no se encuentra, intentamos buscar si el ID corresponde a un ejemplar de algún libro
        logger.info("[DEBUG] No se encontró libro directo. Buscando por ID de ejemplar...");
        Libro libroPorEjemplar = libroRepository.findByEjemplarId(id).orElse(null);
        
        if (libroPorEjemplar != null) {
            logger.info("[DEBUG] Libro encontrado a través de ejemplar: {}", libroPorEjemplar.getTitulo());
        } else {
            logger.warn("[DEBUG] No se encontró ningún libro asociado al ID: {}", id);
        }
        
        return libroPorEjemplar;
    }

    @Override
    public List<Libro> listar() {
        return libroRepository.findAll();
    }

    @SuppressWarnings("null")
    @Override
    public Libro actualizar(@NonNull String id, @NonNull Libro libro) {
        Libro existente = libroRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        if (libro.getTitulo() != null) existente.setTitulo(libro.getTitulo());
        if (libro.getAutores() != null) existente.setAutores(libro.getAutores());
        if (libro.getEditorial() != null) existente.setEditorial(libro.getEditorial());
        if (libro.getGenero() != null) existente.setGenero(libro.getGenero());
        if (libro.getFormato() != null) existente.setFormato(libro.getFormato());
        if (libro.getIsbn() != null) existente.setIsbn(libro.getIsbn());
        if (libro.getPublicacion() != null) existente.setPublicacion(libro.getPublicacion());
        if (libro.getArchivoDigital() != null) existente.setArchivoDigital(libro.getArchivoDigital());
        if (libro.getTieneDigital() != null) existente.setTieneDigital(libro.getTieneDigital());
        if (libro.getEjemplares() != null) existente.setEjemplares(libro.getEjemplares());

        return libroRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        libroRepository.deleteById(Objects.requireNonNull(id));
    }
}
