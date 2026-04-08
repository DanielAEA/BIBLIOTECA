package com.biblioteca.controller;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.entity.Libro;
import com.biblioteca.service.LibroService;
import com.biblioteca.service.QrService;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    private final LibroService libroService;
    private final QrService qrService;

    public LibroController(LibroService libroService, QrService qrService) {
        this.libroService = libroService;
        this.qrService = qrService;
    }

    @GetMapping
    public List<LibroDTO> list() {
        return libroService.listar().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> getById(@PathVariable @NonNull String id) {
        Libro libro = libroService.obtenerPorId(id);
        if (libro == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDTO(libro));
    }

    @PostMapping
    public LibroDTO create(@RequestBody @NonNull Libro libro) {
        Libro creado = libroService.crear(libro);
        System.out.println(">>> LIBRO CREADO: " + creado.getTitulo() + " (ID: " + creado.getId() + ")");
        return convertToDTO(creado);
    }

    @PutMapping("/{id}")
    public LibroDTO update(@PathVariable @NonNull String id, @RequestBody @NonNull Libro libro) {
        Libro actualizado = libroService.actualizar(id, libro);
        return convertToDTO(actualizado);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull String id) {
        libroService.eliminar(id);
    }

    @PostMapping("/{id}/upload-pdf")
    public ResponseEntity<?> uploadPdf(@PathVariable @NonNull String id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.equals("application/pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten archivos PDF"));
            }

            Libro libro = libroService.obtenerPorId(id);
            if (libro == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Libro no encontrado"));
            }

            Path uploadDir = Path.of("uploads/libros");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null && originalFilename.contains("..")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nombre de archivo inválido"));
            }
            String fileName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = uploadDir.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);


            libro.setArchivoDigital("/uploads/libros/" + fileName);
            libro.setTieneDigital(true);
            Libro actualizado = libroService.actualizar(id, libro);

            return ResponseEntity.ok(convertToDTO(actualizado));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar el archivo: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQrImage(@PathVariable @NonNull String id) {
        byte[] qrBytes = qrService.generarQr(id, false);
        if (qrBytes != null) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                    .body(qrBytes);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private LibroDTO convertToDTO(Libro libro) {
        List<LibroDTO.AutorDTO> autoresDTO = null;
        if (libro.getAutores() != null) {
            autoresDTO = libro.getAutores().stream()
                .map(autor -> new LibroDTO.AutorDTO(autor.getId(), autor.getNombre()))
                .collect(Collectors.toList());
        }

        LibroDTO.EditorialDTO editorialDTO = null;
        if (libro.getEditorial() != null) {
            editorialDTO = new LibroDTO.EditorialDTO(
                libro.getEditorial().getId(),
                libro.getEditorial().getNombre()
            );
        }

        LibroDTO.GeneroDTO generoDTO = null;
        if (libro.getGenero() != null) {
            generoDTO = new LibroDTO.GeneroDTO(
                libro.getGenero().getId(),
                libro.getGenero().getNombre()
            );
        }

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
