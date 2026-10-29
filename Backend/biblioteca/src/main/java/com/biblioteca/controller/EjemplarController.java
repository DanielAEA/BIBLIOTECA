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
import java.util.Optional;

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
                    ejMap.put("bloque", e.getBloque());
                    ejMap.put("estante", e.getEstante());
                    
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
                        ejMap.put("bloque", e.getBloque());
                        ejMap.put("estante", e.getEstante());
                        
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

    @PostMapping
    public ResponseEntity<Object> crear(@RequestBody Map<String, Object> payload) {
        String libroId = ((Map<String, String>) payload.get("libro")).get("id");
        String codigo = (String) payload.get("codigo");
        Boolean disponible = (Boolean) payload.get("disponible");
        String bloque = (String) payload.get("bloque");
        String estante = (String) payload.get("estante");

        Optional<Libro> libroOpt = libroRepository.findById(libroId);
        if (libroOpt.isEmpty()) return ResponseEntity.notFound().build();

        Libro libro = libroOpt.get();
        if (libro.getEjemplares() == null) libro.setEjemplares(new ArrayList<>());

        Ejemplar nuevo = new Ejemplar(
            java.util.UUID.randomUUID().toString(),
            codigo.toUpperCase(),
            disponible != null ? disponible : true,
            "DISPONIBLE",
            bloque,
            estante
        );

        libro.getEjemplares().add(nuevo);
        libroRepository.save(libro);

        Map<String, Object> res = new HashMap<>();
        res.put("id", nuevo.getId());
        res.put("codigo", nuevo.getCodigo());
        res.put("disponible", nuevo.getDisponible());
        res.put("estado", nuevo.getEstado());
        res.put("bloque", nuevo.getBloque());
        res.put("estante", nuevo.getEstante());
        res.put("libro", Map.of("id", libro.getId(), "titulo", libro.getTitulo()));

        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> actualizar(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    if (e.getId().equals(id)) {
                        e.setCodigo(((String) payload.get("codigo")).toUpperCase());
                        e.setDisponible((Boolean) payload.get("disponible"));
                        e.setBloque((String) payload.get("bloque"));
                        e.setEstante((String) payload.get("estante"));
                        
                        libroRepository.save(libro);

                        Map<String, Object> res = new HashMap<>();
                        res.put("id", e.getId());
                        res.put("codigo", e.getCodigo());
                        res.put("disponible", e.getDisponible());
                        res.put("estado", e.getEstado());
                        res.put("bloque", e.getBloque());
                        res.put("estante", e.getEstante());
                        res.put("libro", Map.of("id", libro.getId(), "titulo", libro.getTitulo()));

                        return ResponseEntity.ok(res);
                    }
                }
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                boolean removed = libro.getEjemplares().removeIf(e -> e.getId().equals(id));
                if (removed) {
                    libroRepository.save(libro);
                    return ResponseEntity.ok().build();
                }
            }
        }
        return ResponseEntity.notFound().build();
    }
}
