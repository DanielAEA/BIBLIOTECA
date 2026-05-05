package com.biblioteca.service.impl;

import com.biblioteca.entity.Genero;
import com.biblioteca.entity.Libro;
import com.biblioteca.repository.GeneroRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.GeneroService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class GeneroServiceImpl implements GeneroService {

    private final GeneroRepository generoRepository;
    private final LibroRepository libroRepository;

    public GeneroServiceImpl(GeneroRepository generoRepository, LibroRepository libroRepository) {
        this.generoRepository = generoRepository;
        this.libroRepository = libroRepository;
    }

    @Override
    public Genero crear(@NonNull Genero genero) {
        return generoRepository.findByNombre(genero.getNombre())
                .orElseGet(() -> {
                    genero.setId(null);
                    return generoRepository.save(genero);
                });
    }

    @Override
    public Genero obtenerPorId(@NonNull String id) {
        return generoRepository.findById(id).orElse(null);
    }

    @Override
    public List<Genero> listar() {
        return generoRepository.findAll();
    }

    @Override
    public Genero actualizar(@NonNull String id, @NonNull Genero genero) {
        Genero existente = generoRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Género no encontrado"));
        existente.setNombre(genero.getNombre());
        Genero guardado = generoRepository.save(existente);
        
        
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getGenero() != null && id.equals(libro.getGenero().getId())) {
                libro.getGenero().setNombre(guardado.getNombre());
                libroRepository.save(libro);
            }
        }
        
        return guardado;
    }


    @Override
    public void eliminar(@NonNull String id) {
        generoRepository.deleteById(id);
    }
}