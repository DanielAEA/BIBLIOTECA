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
    private final com.biblioteca.service.QrService qrService;

    public EjemplarController(LibroRepository libroRepository, com.biblioteca.service.QrService qrService) {
        this.libroRepository = libroRepository;
        this.qrService = qrService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarTodos() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Libro> libros = libroRepository.findAll();
        
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    if (e == null) continue;
                    String effectiveId = e.getId() != null ? e.getId() : (e.getCodigo() != null ? e.getCodigo() : "sin-id");
                    Map<String, Object> ejMap = new HashMap<>();
                    ejMap.put("id", effectiveId);
                    ejMap.put("codigo", e.getCodigo());
                    ejMap.put("disponible", e.getDisponible() != null ? e.getDisponible() : true);
                    ejMap.put("estado", e.getEstado() != null ? e.getEstado() : "DISPONIBLE");
                    ejMap.put("bloque", e.getBloque());
                    ejMap.put("estante", e.getEstante());
                    ejMap.put("urlQr", "/api/ejemplares/" + effectiveId + "/qr");
                    
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
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String searchId = id.trim();
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    if (e == null) continue;
                    String ejId = e.getId();
                    String ejCodigo = e.getCodigo();
                    if (searchId.equals(ejId) || (ejCodigo != null && searchId.equalsIgnoreCase(ejCodigo))) {
                        String effectiveId = ejId != null ? ejId : ejCodigo;
                        Map<String, Object> ejMap = new HashMap<>();
                        ejMap.put("id", effectiveId);
                        ejMap.put("codigo", ejCodigo);
                        ejMap.put("disponible", e.getDisponible() != null ? e.getDisponible() : true);
                        ejMap.put("estado", e.getEstado() != null ? e.getEstado() : "DISPONIBLE");
                        ejMap.put("bloque", e.getBloque());
                        ejMap.put("estante", e.getEstante());
                        ejMap.put("urlQr", "/api/ejemplares/" + effectiveId + "/qr");
                        
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

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQr(@PathVariable String id) {
        byte[] qrBytes = qrService.generarQr(id, true);
        if (qrBytes != null) {
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, org.springframework.http.MediaType.IMAGE_PNG_VALUE)
                    .body(qrBytes);
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
        if (id == null) return ResponseEntity.notFound().build();
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                for (Ejemplar e : libro.getEjemplares()) {
                    if (e == null) continue;
                    if (id.equals(e.getId()) || (e.getCodigo() != null && id.equalsIgnoreCase(e.getCodigo()))) {
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
        if (id == null) return ResponseEntity.notFound().build();
        List<Libro> libros = libroRepository.findAll();
        for (Libro libro : libros) {
            if (libro.getEjemplares() != null) {
                boolean removed = libro.getEjemplares().removeIf(e -> e != null && (id.equals(e.getId()) || (e.getCodigo() != null && id.equalsIgnoreCase(e.getCodigo()))));
                if (removed) {
                    libroRepository.save(libro);
                    return ResponseEntity.ok().build();
                }
            }
        }
        return ResponseEntity.notFound().build();
    }
}
