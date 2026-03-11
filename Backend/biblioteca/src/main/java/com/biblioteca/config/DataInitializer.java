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
        initializeAdminUser();
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

    private void initializeAdminUser() {
        if (usuarioRepository.count() == 0) {
            RolUsuario rolAdmin = rolUsuarioRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Rol ADMIN no encontrado"));

            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo("admin@bib.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Password por defecto
            admin.setRol(rolAdmin);

            usuarioRepository.save(admin);
            System.out.println(">>> Usuario ADMIN creado por defecto: admin@bib.com / admin123");
        }
    }
}
