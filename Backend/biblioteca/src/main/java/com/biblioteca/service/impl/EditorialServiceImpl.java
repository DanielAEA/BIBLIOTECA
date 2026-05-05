package com.biblioteca.service.impl;

import com.biblioteca.entity.Editorial;
import com.biblioteca.entity.Libro;
import com.biblioteca.repository.EditorialRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.EditorialService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class EditorialServiceImpl implements EditorialService {

    private final EditorialRepository editorialRepository;
    private final LibroRepository libroRepository;

    public EditorialServiceImpl(EditorialRepository editorialRepository, LibroRepository libroRepository) {
        this.editorialRepository = editorialRepository;
        this.libroRepository = libroRepository;
    }

    @Override
    public Editorial crear(@NonNull Editorial editorial) {
        return editorialRepository.findByNombre(editorial.getNombre())
                .orElseGet(() -> {
                    editorial.setId(null);
                    return editorialRepository.save(editorial);
                });
    }

    @Override
    public Editorial obtenerPorId(@NonNull String id) {
        return editorialRepository.findById(id).orElse(null);
    }

    @Override
    public List<Editorial> listar() {
        return editorialRepository.findAll();
    }

    @Override
    public Editorial actualizar(@NonNull String id, @NonNull Editorial editorial) {
        Editorial existente = editorialRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Editorial no encontrada"));
        existente.setNombre(editorial.getNombre());
        Editorial guardado = editorialRepository.save(existente);
        
        
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEditorial() != null && id.equals(libro.getEditorial().getId())) {
                libro.getEditorial().setNombre(guardado.getNombre());
                libroRepository.save(libro);
            }
        }
        
        return guardado;
    }

    @Override
    public void eliminar(@NonNull String id) {
        editorialRepository.deleteById(id);
    }
}