package com.biblioteca.service.impl;

import com.biblioteca.entity.Autor;
import com.biblioteca.entity.Libro;
import com.biblioteca.repository.AutorRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.AutorService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class AutorServiceImpl implements AutorService {

    private final AutorRepository autorRepository;
    private final LibroRepository libroRepository;

    public AutorServiceImpl(AutorRepository autorRepository, LibroRepository libroRepository) {
        this.autorRepository = autorRepository;
        this.libroRepository = libroRepository;
    }

    @Override
    public Autor crear(@NonNull Autor autor) {
        return autorRepository.findByNombre(autor.getNombre())
                .orElseGet(() -> {
                    autor.setId(null);
                    return autorRepository.save(autor);
                });
    }

    @Override
    public Autor obtenerPorId(@NonNull String id) {
        return autorRepository.findById(id).orElse(null);
    }

    @Override
    public List<Autor> listar() {
        return autorRepository.findAll();
    }

    @Override
    public Autor actualizar(@NonNull String id, @NonNull Autor autor) {
        Autor existente = autorRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Autor no encontrado"));
        existente.setNombre(autor.getNombre());
        Autor guardado = autorRepository.save(existente);
        
        
        List<Libro> libros = libroRepository.findAll(); 
        for (Libro libro : libros) {
            boolean modificado = false;
            if (libro.getAutores() != null) {
                for (Autor a : libro.getAutores()) {
                    if (id.equals(a.getId())) {
                        a.setNombre(guardado.getNombre());
                        modificado = true;
                    }
                }
            }
            if (modificado) {
                libroRepository.save(libro);
            }
        }
        
        return guardado;
    }


    @Override
    public void eliminar(@NonNull String id) {
        autorRepository.deleteById(id);
    }
}