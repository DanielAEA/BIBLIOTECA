package com.biblioteca.service.impl;

import com.biblioteca.entity.Ejemplar;
import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.EjemplarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class EjemplarServiceImpl implements EjemplarService {

    private static final Logger logger = LoggerFactory.getLogger(EjemplarServiceImpl.class);
    private final LibroRepository libroRepository;

    public EjemplarServiceImpl(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @Override
    public Ejemplar crear(@NonNull Ejemplar ejemplar) {
        String bookId = Optional.ofNullable(ejemplar.getLibro())
                .map(Libro::getId)
                .filter(id -> !id.isEmpty())
                .orElseThrow(() -> new RuntimeException("El ejemplar debe estar asociado a un libro"));

        logger.info(">>> BUSCANDO LIBRO PARA EJEMPLAR: {}", bookId);
        Libro libro = libroRepository.findById(java.util.Objects.requireNonNull(bookId))
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        if (libro.getEjemplares() == null) {
            libro.setEjemplares(new ArrayList<>());
        }

        ejemplar.setId(UUID.randomUUID().toString());
        // Limpiamos la referencia al libro padre para evitar recursión infinita en el JSON
        // pero mantenemos lo necesario para el frontend
        Libro simplifiedLibro = new Libro();
        simplifiedLibro.setId(libro.getId());
        simplifiedLibro.setTitulo(libro.getTitulo());
        
        libro.getEjemplares().add(ejemplar);
        libroRepository.save(libro);
        
        ejemplar.setLibro(simplifiedLibro);
        logger.info(">>> EJEMPLAR GUARDADO EXITOSAMENTE: {}", ejemplar.getCodigo());
        return ejemplar;
    }

    @Override
    public Ejemplar obtenerPorId(@NonNull String id) {
        return listar().stream()
                .filter(e -> id.equals(e.getId()))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Ejemplar> listar() {
        return libroRepository.findAll().stream()
                .flatMap(libro -> {
                    if (libro.getEjemplares() == null) return Stream.empty();
                    return libro.getEjemplares().stream().peek(e -> {
                        Libro simplifiedLibro = new Libro();
                        simplifiedLibro.setId(libro.getId());
                        simplifiedLibro.setTitulo(libro.getTitulo());
                        e.setLibro(simplifiedLibro);
                    });
                })
                .toList();
    }

    @Override
    public Ejemplar actualizar(@NonNull String id, @NonNull Ejemplar ejemplar) {
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() == null) continue;
            for (int i = 0; i < libro.getEjemplares().size(); i++) {
                if (id.equals(libro.getEjemplares().get(i).getId())) {
                    ejemplar.setId(id);
                    libro.getEjemplares().set(i, ejemplar);
                    libroRepository.save(libro);
                    return ejemplar;
                }
            }
        }
        throw new RuntimeException("Ejemplar no encontrado");
    }

    @Override
    public void eliminar(@NonNull String id) {
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() == null) continue;
            boolean removed = libro.getEjemplares().removeIf(e -> id.equals(e.getId()));
            if (removed) {
                libroRepository.save(libro);
                return;
            }
        }
    }
}
