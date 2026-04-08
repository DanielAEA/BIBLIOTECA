package com.biblioteca.controller;

import com.biblioteca.entity.Ejemplar;
import com.biblioteca.service.EjemplarService;
import com.biblioteca.service.QrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
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

import java.util.List;

@RestController
@RequestMapping("/api/ejemplares")
@CrossOrigin(origins = "*")
public class EjemplarController {

    private static final Logger logger = LoggerFactory.getLogger(EjemplarController.class);
    private final EjemplarService ejemplarService;
    private final QrService qrService;

    public EjemplarController(EjemplarService ejemplarService, QrService qrService) {
        this.ejemplarService = ejemplarService;
        this.qrService = qrService;
    }

    @GetMapping
    public ResponseEntity<List<Ejemplar>> listar() {
        return ResponseEntity.ok(ejemplarService.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ejemplar> obtener(@PathVariable @NonNull String id) {
        Ejemplar ejemplar = ejemplarService.obtenerPorId(id);
        return ejemplar != null ? ResponseEntity.ok(ejemplar) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Ejemplar> crear(@RequestBody @NonNull Ejemplar ejemplar) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ejemplarService.crear(ejemplar));
        } catch (Exception e) {
            logger.error("Error al crear ejemplar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ejemplar> actualizar(@PathVariable @NonNull String id, @RequestBody @NonNull Ejemplar ejemplar) {
        try {
            return ResponseEntity.ok(ejemplarService.actualizar(id, ejemplar));
        } catch (Exception e) {
            logger.error("Error al actualizar ejemplar {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable @NonNull String id) {
        try {
            ejemplarService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error al eliminar ejemplar {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQrImage(@PathVariable @NonNull String id) {
        byte[] qrBytes = qrService.generarQr(id, true);
        if (qrBytes == null) {
            logger.error("Error al generar imagen QR para el ejemplar: {}", id);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(qrBytes);
    }
}
