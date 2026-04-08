package com.biblioteca.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @PostMapping("/regenerar-qr")
    public ResponseEntity<Map<String, Object>> regenerarQr() {
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Los QR ahora se generan dinámicamente. No es necesario regenerarlos.");
        response.put("total", 0);
        
        return ResponseEntity.ok(response);
    }
}
