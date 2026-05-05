package com.biblioteca.service;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public Map<String, Object> register(Usuario usuario) {
        
        if (usuarioRepository.findByCorreo(usuario.getCorreo()) != null) {
            throw new RuntimeException("El correo ya está registrado");
        }

        
        usuario.setRol("CLIENTE");
        
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        try {
            Usuario guardado = usuarioRepository.save(usuario);
            return Map.of(
                    "mensaje", "Usuario registrado exitosamente",
                    "idUsuario", guardado.getId());
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el usuario: " + e.getMessage());
        }
    }

    public Map<String, Object> login(String email, String password) {
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        
        Usuario usuario = usuarioRepository.findByCorreo(email);
        String token = jwtService.generateToken(usuario);

        return Map.of("token", token);
    }
}
