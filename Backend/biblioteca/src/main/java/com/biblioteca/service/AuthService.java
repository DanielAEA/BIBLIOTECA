package com.biblioteca.service;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.RolUsuarioRepository;
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
    private final RolUsuarioRepository rolUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RolUsuarioRepository rolUsuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public Map<String, Object> register(Usuario usuario) {
        // Verificar si el correo ya existe
        if (usuarioRepository.findByCorreo(usuario.getCorreo()) != null) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // Asignar el rol de 'CLIENTE' por defecto a los nuevos registros
        com.biblioteca.entity.RolUsuario rolCliente = rolUsuarioRepository.findByNombre("CLIENTE")
                .orElseThrow(
                        () -> new RuntimeException("Error interno: El rol 'CLIENTE' no existe en la base de datos"));

        usuario.setId(null); // <-- Prevenir Mass Assignment
        usuario.setRol(rolCliente);
        // Encriptar la contraseña antes de guardar
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
        // Autenticar credenciales
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        // Obtener usuario y generar token JWT
        Usuario usuario = usuarioRepository.findByCorreo(email);
        String token = jwtService.generateToken(usuario);

        return Map.of("token", token);
    }
}
