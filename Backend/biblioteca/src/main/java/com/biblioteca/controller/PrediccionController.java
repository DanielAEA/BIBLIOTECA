package com.biblioteca.controller;

import com.biblioteca.dto.PrediccionDTO;
import com.biblioteca.service.PrediccionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predicciones")
@CrossOrigin(origins = "*")
public class PrediccionController {

    private final PrediccionService prediccionService;

    public PrediccionController(PrediccionService prediccionService) {
        this.prediccionService = prediccionService;
    }

    @PostMapping("/prestamos")
    public ResponseEntity<PrediccionDTO.Response> predecir(@RequestBody PrediccionDTO.Request request) {
        return ResponseEntity.ok(prediccionService.predecirDemanda(request));
    }
}
