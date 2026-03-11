package com.biblioteca.config;

import com.biblioteca.entity.RolUsuario;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.RolUsuarioRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolUsuarioRepository rolUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RolUsuarioRepository rolUsuarioRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeUsers();
    }

    private void initializeRoles() {
        List<String> roles = List.of("ADMIN", "BIBLIOTECARIO", "CLIENTE");
        for (String roleName : roles) {
            if (rolUsuarioRepository.findByNombre(roleName).isEmpty()) {
                RolUsuario rol = new RolUsuario();
                rol.setNombre(roleName);
                rolUsuarioRepository.save(rol);
            }
        }
    }

    private void initializeUsers() {
        if (usuarioRepository.count() == 0) {
            RolUsuario rolAdmin = rolUsuarioRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Rol ADMIN no encontrado"));

            RolUsuario rolCliente = rolUsuarioRepository.findByNombre("CLIENTE")
                    .orElseThrow(() -> new RuntimeException("Error: Rol CLIENTE no encontrado"));

            // Usuario ADMIN
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo("admin@bib.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRol(rolAdmin);
            usuarioRepository.save(admin);
            System.out.println(">>> Usuario ADMIN creado: admin@bib.com / admin123");

            // Usuario PRUEBA
            Usuario prueba = new Usuario();
            prueba.setNombre("Usuario Prueba");
            prueba.setCorreo("prueba@bib.com");
            prueba.setPassword(passwordEncoder.encode("prueba123"));
            prueba.setRol(rolCliente);
            usuarioRepository.save(prueba);
            System.out.println(">>> Usuario PRUEBA creado: prueba@bib.com / prueba123");
        }
    }
}
