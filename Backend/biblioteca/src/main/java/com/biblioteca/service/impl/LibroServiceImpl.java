package com.biblioteca.service.impl;

import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.LibroService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LibroServiceImpl implements LibroService {

    private final LibroRepository libroRepository;

    public LibroServiceImpl(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @Override
    public Libro crear(@NonNull Libro libro) {
        libro.setId(null);
        return libroRepository.save(libro);
    }

    @Override
    public Libro obtenerPorId(@NonNull Long id) {
        return libroRepository.findById(id).orElse(null);
    }

    @Override
    public List<Libro> listar() { return libroRepository.findAll(); }

    @Override
    @Transactional
    public Libro actualizar(@NonNull Long id, @NonNull Libro libro) {
        Libro existente = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        // Actualizar campos básicos si vienen en el objeto
        if (libro.getTitulo() != null) existente.setTitulo(libro.getTitulo());
        if (libro.getAutores() != null) existente.setAutores(libro.getAutores());
        if (libro.getEditorial() != null) existente.setEditorial(libro.getEditorial());
        if (libro.getGenero() != null) existente.setGenero(libro.getGenero());
        if (libro.getFormato() != null) existente.setFormato(libro.getFormato());
        if (libro.getIsbn() != null) existente.setIsbn(libro.getIsbn());
        if (libro.getPublicacion() != null) existente.setPublicacion(libro.getPublicacion());

        // El archivo digital y tiene_digital no deberían borrarse si el payload no los trae
        if (libro.getArchivoDigital() != null) existente.setArchivoDigital(libro.getArchivoDigital());
        if (libro.getTieneDigital() != null) existente.setTieneDigital(libro.getTieneDigital());

        return libroRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull Long id) {
        libroRepository.deleteById(id);
    }
}
