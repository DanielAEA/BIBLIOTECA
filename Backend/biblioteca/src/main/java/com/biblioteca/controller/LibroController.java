package com.biblioteca.controller;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.entity.Ejemplar;
import com.biblioteca.entity.Libro;
import com.biblioteca.service.LibroService;
import com.biblioteca.service.QrService;
import com.biblioteca.service.BookMetadataService;
import com.biblioteca.service.CoverService;
import com.biblioteca.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    private final LibroService libroService;
    private final QrService qrService;
    private final CoverService coverService;
    private final BookMetadataService bookMetadataService;
    private final LibroRepository libroRepository;

    @Value("${sibu.storage.path}")
    private String storagePath;

    public LibroController(LibroService libroService, QrService qrService, CoverService coverService, 
                          BookMetadataService bookMetadataService, LibroRepository libroRepository) {
        this.libroService = libroService;
        this.qrService = qrService;
        this.coverService = coverService;
        this.bookMetadataService = bookMetadataService;
        this.libroRepository = libroRepository;
    }

    @PostMapping("/{id}/upload-pdf")
    public ResponseEntity<?> uploadPdf(@PathVariable @NonNull String id, @RequestParam("file") @NonNull MultipartFile file) {
        System.out.println("[DEBUG] Recibiendo PDF para libro: " + id + ", nombre: " + file.getOriginalFilename());
        try {
            Libro libro = libroService.obtenerPorId(id);
            if (libro == null) return ResponseEntity.notFound().build();

            if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(storagePath, "libros", fileName);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            libro.setArchivoDigital("/api/libros/download-pdf/" + fileName);
            libro.setTieneDigital(true);
            libroService.actualizar(id, libro);

            return ResponseEntity.ok(convertToDTO(libro));
        } catch (Exception e) {
            System.err.println("[ERROR] Fallo al subir PDF: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar el PDF: " + e.getMessage()));
        }
    }

    @GetMapping("/download-pdf/{fileName}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable @NonNull String fileName) {
        try {
            Path path = Paths.get(storagePath, "libros", fileName);
            if (!Files.exists(path)) return ResponseEntity.notFound().build();

            byte[] content = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(Objects.requireNonNull(MediaType.APPLICATION_PDF))
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public List<LibroDTO> getAll() {
        return libroService.listar().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @GetMapping("/cover-preview")
    public ResponseEntity<Map<String, String>> coverPreview(@RequestParam @NonNull String isbn) {
        String url = coverService.fetchCoverByIsbn(isbn);
        if (url == null || url.isBlank()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/metadata")
    public ResponseEntity<Map<String, Object>> getMetadata(@RequestParam @NonNull String isbn) {
        Map<String, Object> metadata = bookMetadataService.fetchMetadataByIsbn(isbn);
        if (metadata == null || metadata.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(metadata);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroDTO> getById(@PathVariable @NonNull String id) {
        Libro libro = libroService.obtenerPorId(id);
        if (libro == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToDTO(libro));
    }

    @PostMapping
    public LibroDTO create(@RequestBody @NonNull Libro libro) {
        Libro creado = libroService.crear(libro);
        return convertToDTO(creado);
    }

    @PutMapping("/{id}")
    public LibroDTO update(@PathVariable @NonNull String id, @RequestBody @NonNull Libro libro) {
        Libro actualizado = libroService.actualizar(id, libro);
        return convertToDTO(actualizado);
    }

    @DeleteMapping("/bulk-delete")
    public ResponseEntity<?> bulkDelete(@RequestBody @NonNull List<String> ids) {
        libroService.eliminarVarios(ids);
        return ResponseEntity.ok(Map.of("message", "Libros eliminados correctamente"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable @NonNull String id) {
        libroService.eliminar(id);
    }

    
    
    

    @PostMapping("/{id}/ejemplares")
    public ResponseEntity<?> addEjemplar(@PathVariable @NonNull String id, @RequestBody @NonNull Ejemplar ejemplar) {
        try {
            if (ejemplar.getCodigo() == null || ejemplar.getCodigo().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El código del ejemplar es obligatorio"));
            }

            String codigoUpper = ejemplar.getCodigo().trim().toUpperCase();
            
            
            Optional<Libro> libConEj = libroRepository.findByEjemplarId(codigoUpper);
            if (libConEj.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "El código '" + codigoUpper + "' ya está registrado en otro ejemplar"));
            }

            Libro libro = libroService.obtenerPorId(id);
            if (libro == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Libro no encontrado"));

            if (libro.getEjemplares() == null) {
                libro.setEjemplares(new ArrayList<>());
            }

            ejemplar.setId(java.util.UUID.randomUUID().toString());
            ejemplar.setCodigo(codigoUpper);
            ejemplar.setEstado("DISPONIBLE");
            ejemplar.setDisponible(true);

            libro.getEjemplares().add(ejemplar);
            Libro actualizado = libroService.actualizar(id, libro);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(actualizado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    @GetMapping("/ejemplares/next-code")
    public Map<String, String> getNextEjemplarCode() {
        List<Libro> todos = libroService.listar();
        int max = 0;
        for (Libro l : todos) {
            if (l.getEjemplares() != null) {
                for (Ejemplar e : l.getEjemplares()) {
                    if (e.getCodigo() != null && e.getCodigo().startsWith("LIB")) {
                        try {
                            int num = Integer.parseInt(e.getCodigo().substring(3));
                            if (num > max) max = num;
                        } catch (Exception ignored) {}
                    }
                }
            }
        }
        return Map.of("nextCode", String.format("LIB%03d", max + 1));
    }

    @DeleteMapping("/{id}/ejemplares/{ejemplarId}")
    public ResponseEntity<LibroDTO> deleteEjemplar(@PathVariable @NonNull String id,
                                                    @PathVariable @NonNull String ejemplarId) {
        Libro libro = libroService.obtenerPorId(id);
        if (libro == null || libro.getEjemplares() == null) return ResponseEntity.notFound().build();

        boolean removed = libro.getEjemplares().removeIf(e -> ejemplarId.equals(e.getId()));
        if (!removed) return ResponseEntity.notFound().build();

        Libro actualizado = libroService.actualizar(id, libro);
        return ResponseEntity.ok(convertToDTO(actualizado));
    }

    @GetMapping("/{id}/ejemplares/{ejemplarId}/qr")
    public ResponseEntity<byte[]> getEjemplarQr(@PathVariable @NonNull String id,
                                                 @PathVariable @NonNull String ejemplarId) {
        byte[] qrBytes = qrService.generarQr(ejemplarId, true);
        if (qrBytes != null) {
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE).body(qrBytes);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQrImage(@PathVariable @NonNull String id) {
        byte[] qrBytes = qrService.generarQr(id, false);
        if (qrBytes != null) {
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE).body(qrBytes);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    private LibroDTO convertToDTO(Libro libro) {
        int stock = 0;
        List<LibroDTO.EjemplarDTO> ejemplarDTOs = new ArrayList<>();
        if (libro.getEjemplares() != null) {
            stock = (int) libro.getEjemplares().stream()
                    .filter(e -> Boolean.TRUE.equals(e.getDisponible()))
                    .count();
            ejemplarDTOs = libro.getEjemplares().stream()
                    .map(e -> new LibroDTO.EjemplarDTO(e.getId(), e.getCodigo(), e.getDisponible(), e.getEstado()))
                    .collect(Collectors.toList());
        }

        return new LibroDTO(
            libro.getId(),
            libro.getTitulo(),
            libro.getAutores() != null ? libro.getAutores().stream().map(a -> new LibroDTO.AutorDTO(a.getId(), a.getNombre())).collect(Collectors.toList()) : null,
            libro.getEditorial() != null ? new LibroDTO.EditorialDTO(libro.getEditorial().getId(), libro.getEditorial().getNombre()) : null,
            libro.getGenero() != null ? new LibroDTO.GeneroDTO(libro.getGenero().getId(), libro.getGenero().getNombre()) : null,
            stock, 
            libro.getArchivoDigital(), 
            libro.getTieneDigital(), 
            libro.getFormato(),
            libro.getIsbn(),
            libro.getUrlPortada(),
            "/api/libros/" + libro.getId() + "/qr",
            libro.getCodigo(),
            libro.getPublicacion(),
            libro.getDescripcion(),
            ejemplarDTOs
        );
    }
}
