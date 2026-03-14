package com.biblioteca.controller;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.entity.Libro;
import com.biblioteca.service.LibroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private LibroService libroService;

    @GetMapping
    public List<LibroDTO> list() {
        return libroService.listar().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public LibroDTO getById(@PathVariable @NonNull Long id) {
        Libro libro = libroService.obtenerPorId(id);
        return libro != null ? convertToDTO(libro) : null;
    }

    @PostMapping
    public LibroDTO create(@RequestBody @NonNull Libro libro) {
        Libro creado = libroService.crear(libro);
        return convertToDTO(creado);
    }

    @PutMapping("/{id}")
    public LibroDTO update(@PathVariable @NonNull Long id, @RequestBody @NonNull Libro libro) {
        Libro actualizado = libroService.actualizar(id, libro);
        return convertToDTO(actualizado);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull Long id) {
        libroService.eliminar(id);
    }

    @PostMapping("/{id}/upload-pdf")
    public ResponseEntity<?> uploadPdf(@PathVariable @NonNull Long id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        try {
            // Verificar que sea un PDF
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten archivos PDF"));
            }

            Libro libro = libroService.obtenerPorId(id);
            if (libro == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Libro no encontrado"));
            }

            // Crear el directorio si no existe
            Path uploadDir = Paths.get("uploads/libros");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generar un nombre único para el archivo
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);

            // Guardar el archivo
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Actualizar el libro
            libro.setArchivoDigital("/uploads/libros/" + fileName);
            libro.setTieneDigital(true);
            Libro actualizado = libroService.actualizar(id, libro);

            return ResponseEntity.ok(convertToDTO(actualizado));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar el archivo: " + e.getMessage()));
        }
    }

    private LibroDTO convertToDTO(Libro libro) {
        // Convertir autores
        List<LibroDTO.AutorDTO> autoresDTO = null;
        if (libro.getAutores() != null) {
            autoresDTO = libro.getAutores().stream()
                .map(autor -> new LibroDTO.AutorDTO(autor.getId(), autor.getNombre()))
                .collect(Collectors.toList());
        }

        // Convertir editorial
        LibroDTO.EditorialDTO editorialDTO = null;
        if (libro.getEditorial() != null) {
            editorialDTO = new LibroDTO.EditorialDTO(
                libro.getEditorial().getId(),
                libro.getEditorial().getNombre()
            );
        }

        // Convertir género
        LibroDTO.GeneroDTO generoDTO = null;
        if (libro.getGenero() != null) {
            generoDTO = new LibroDTO.GeneroDTO(
                libro.getGenero().getId(),
                libro.getGenero().getNombre()
            );
        }

        // Calcular stock disponible (ejemplares disponibles)
        int stockDisponible = 0;
        if (libro.getEjemplares() != null) {
            stockDisponible = (int) libro.getEjemplares().stream()
                .filter(ejemplar -> ejemplar.getDisponible() != null && ejemplar.getDisponible())
                .count();
        }

        return new LibroDTO(
            libro.getId(),
            libro.getTitulo(),
            autoresDTO,
            editorialDTO,
            generoDTO,
            stockDisponible,
            libro.getArchivoDigital(),
            libro.getTieneDigital(),
            libro.getFormato()
        );
    }
}

