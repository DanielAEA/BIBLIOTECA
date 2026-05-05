package com.biblioteca.controller;

import com.biblioteca.entity.Ejemplar;
import com.biblioteca.entity.Libro;
import com.biblioteca.repository.LibroRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ejemplares")
@CrossOrigin(origins = "*")
public class EjemplarController {

    private final LibroRepository libroRepository;

    public EjemplarController(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarTodos() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Libro> libros = libroRepository.findAll();
        
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    Map<String, Object> ejMap = new HashMap<>();
                    ejMap.put("id", e.getId());
                    ejMap.put("codigo", e.getCodigo());
                    ejMap.put("disponible", e.getDisponible());
                    ejMap.put("estado", e.getEstado());
                    
                    Map<String, Object> libMap = new HashMap<>();
                    libMap.put("id", libro.getId());
                    libMap.put("titulo", libro.getTitulo());
                    
                    ejMap.put("libro", libMap);
                    result.add(ejMap);
                }
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> obtenerPorId(@PathVariable String id) {
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    if (e.getId().equals(id)) {
                        Map<String, Object> ejMap = new HashMap<>();
                        ejMap.put("id", e.getId());
                        ejMap.put("codigo", e.getCodigo());
                        ejMap.put("disponible", e.getDisponible());
                        ejMap.put("estado", e.getEstado());
                        
                        Map<String, Object> libMap = new HashMap<>();
                        libMap.put("id", libro.getId());
                        libMap.put("titulo", libro.getTitulo());
                        
                        ejMap.put("libro", libMap);
                        return ResponseEntity.ok(ejMap);
                    }
                }
            }
        }
        return ResponseEntity.notFound().build();
    }
}
