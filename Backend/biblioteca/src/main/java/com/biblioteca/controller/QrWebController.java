package com.biblioteca.controller;

import com.biblioteca.service.QrService;
import com.biblioteca.repository.LibroRepository;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.CacheControl;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/qr")
@CrossOrigin(origins = "*")
public class QrWebController {

    private final QrService qrService;
    private final LibroRepository libroRepository;

    public QrWebController(QrService qrService, LibroRepository libroRepository) {
        this.qrService = qrService;
        this.libroRepository = libroRepository;
    }

    /**
     * Intercepta peticiones de imágenes QR y las genera al vuelo.
     * Captura el nombre completo del archivo incluyendo su extensión.
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getQrDynamic(@PathVariable @NonNull String filename) {
        // Extraer el ID real quitando prefijos y la extensión .png
        String id = filename.replace(".png", "")
                            .replace("qr-ejemplar-", "")
                            .replace("qr-", "");
        
        // Consultar a la base de datos si el ID corresponde a un ejemplar
        // de algún libro, para decidir qué tipo de URL incrustar en el QR.
        boolean esEjemplar = libroRepository.findByEjemplarId(id).isPresent();
        
        byte[] qrBytes = qrService.generarQr(Objects.requireNonNull(id), esEjemplar);
        
        if (qrBytes != null) {
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noCache())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                    .body(qrBytes);
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
