package com.biblioteca.controller;

import com.biblioteca.dto.SocialLoginRequest;
import com.biblioteca.entity.Usuario;
import com.biblioteca.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/auth", "/api/auth"})
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(usuario));
        } catch (Exception e) {
            logger.error("Error en registro: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        try {
            String email = request.getCorreo() != null ? request.getCorreo() : request.getUsername();
            return ResponseEntity.ok(authService.login(email, request.getPassword()));
        } catch (Exception e) {
            logger.error("Error de login para {}: {}", request.getCorreo(), e.getMessage());
            String errorMsg = e.getMessage() != null && e.getMessage().contains("social")
                    ? e.getMessage()
                    : "Credenciales incorrectas";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", errorMsg));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<Object> loginGoogle(@RequestBody SocialLoginRequest request) {
        try {
            if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El token de Google es requerido"));
            }
            return ResponseEntity.ok(authService.loginGoogle(request.getIdToken()));
        } catch (Exception e) {
            logger.error("Error en autenticación Google: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al autenticar con Google"));
        }
    }

    @PostMapping("/microsoft")
    public ResponseEntity<Object> loginMicrosoft(@RequestBody SocialLoginRequest request) {
        try {
            if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El token de Microsoft es requerido"));
            }
            return ResponseEntity.ok(authService.loginMicrosoft(request.getIdToken()));
        } catch (Exception e) {
            logger.error("Error en autenticación Microsoft: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Error al autenticar con Microsoft"));
        }
    }

    public static class LoginRequest {
        private String correo;
        private String username;
        private String password;

        public String getCorreo() {
            return correo;
        }

        public void setCorreo(String correo) {
            this.correo = correo;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
