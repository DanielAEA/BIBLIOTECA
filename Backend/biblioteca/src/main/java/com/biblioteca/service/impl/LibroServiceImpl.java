package com.biblioteca.service.impl;

import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.LibroService;
import com.biblioteca.service.CoverService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class LibroServiceImpl implements LibroService {

    private static final Logger logger = LoggerFactory.getLogger(LibroServiceImpl.class);
    private final LibroRepository libroRepository;
    private final CoverService coverService;

    @Value("${sibu.cover.default-url}")
    private String defaultCoverUrl;

    public LibroServiceImpl(LibroRepository libroRepository, CoverService coverService) {
        this.libroRepository = libroRepository;
        this.coverService = coverService;
    }

    @Override
    public synchronized Libro crear(@NonNull Libro libro) {
        libro.setId(null);
        if (libro.getCodigo() == null || libro.getCodigo().isBlank()) {
            libro.setCodigo(generarSiguienteCodigo());
        }
        if (libro.getIsbn() != null && !libro.getIsbn().isBlank()) {
            String cover = coverService.fetchCoverByIsbn(libro.getIsbn());
            if (cover != null) libro.setUrlPortada(cover);
        }
        if (libro.getUrlPortada() == null || libro.getUrlPortada().isBlank()) {
            libro.setUrlPortada(defaultCoverUrl);
        }
        return Objects.requireNonNull(libroRepository.save(libro));
    }

    private String generarSiguienteCodigo() {
        List<Libro> libros = libroRepository.findAll();
        int max = 0;
        for (Libro l : libros) {
            if (l.getCodigo() != null && l.getCodigo().startsWith("LIB")) {
                try {
                    int num = Integer.parseInt(l.getCodigo().substring(3));
                    if (num > max) max = num;
                } catch (Exception ignored) {}
            }
        }
        return String.format("LIB%04d", max + 1);
    }

    @Override
    public void asignarCodigosLibros() {
        List<Libro> libros = libroRepository.findAll();
        int count = 1;
        for (Libro l : libros) {
            if (l.getCodigo() == null || l.getCodigo().isBlank()) {
                String nuevoCodigo = String.format("LIB%04d", count++);
                while (codigoExiste(nuevoCodigo, libros)) {
                    nuevoCodigo = String.format("LIB%04d", count++);
                }
                l.setCodigo(nuevoCodigo);
                libroRepository.save(l);
            }
        }
    }

    private boolean codigoExiste(String codigo, List<Libro> libros) {
        return libros.stream().anyMatch(l -> codigo.equals(l.getCodigo()));
    }

    @Override
    public Libro obtenerPorId(@NonNull String id) {
        logger.info("[DEBUG] Buscando libro para ID: {}", id);
        Optional<Libro> libro = libroRepository.findById(id);
        if (libro.isPresent()) {
            return libro.get();
        }
        
        return libroRepository.findByEjemplarId(id).orElse(null);
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
        
        if (libro.getIsbn() != null && !libro.getIsbn().isBlank()) {
            if (!libro.getIsbn().equals(existente.getIsbn())) {
                existente.setIsbn(libro.getIsbn());
                String cover = coverService.fetchCoverByIsbn(libro.getIsbn());
                if (cover != null) existente.setUrlPortada(cover);
            }
        }
        
        if (libro.getUrlPortada() != null) existente.setUrlPortada(libro.getUrlPortada());
        if (existente.getUrlPortada() == null || existente.getUrlPortada().isBlank()) {
            existente.setUrlPortada(defaultCoverUrl);
        }

        if (libro.getFormato() != null) existente.setFormato(libro.getFormato());
        if (libro.getPublicacion() != null) existente.setPublicacion(libro.getPublicacion());
        if (libro.getArchivoDigital() != null) existente.setArchivoDigital(libro.getArchivoDigital());
        if (libro.getTieneDigital() != null) existente.setTieneDigital(libro.getTieneDigital());
        
        
        if (libro.getEjemplares() != null) {
            existente.setEjemplares(libro.getEjemplares());
        }

        return libroRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        libroRepository.deleteById(Objects.requireNonNull(id));
    }

    @Override
    public void eliminarVarios(@NonNull List<String> ids) {
        ids.forEach(id -> libroRepository.deleteById(Objects.requireNonNull(id)));
        logger.info("✅ Eliminados {} libros masivamente.", ids.size());
    }
}
