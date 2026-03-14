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
        fixPlainTextPasswords();
        ensureAdminUser();
    }

    /**
     * Asegura que el usuario admin exista con la contraseña correcta (admin123).
     * Si ya existe pero la contraseña no coincide, la resetea.
     */
    private void ensureAdminUser() {
        String adminEmail = "admin@bib.com";
        String adminPassword = "admin123";

        Usuario admin = usuarioRepository.findByCorreo(adminEmail);
        if (admin == null) {
            // El admin no existe, crearlo
            RolUsuario rolAdmin = rolUsuarioRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Rol ADMIN no encontrado"));
            admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRol(rolAdmin);
            usuarioRepository.save(admin);
            System.out.println(">>> Usuario ADMIN creado: " + adminEmail + " / " + adminPassword);
        } else if (!passwordEncoder.matches(adminPassword, admin.getPassword())) {
            // La contraseña no coincide, resetearla
            admin.setPassword(passwordEncoder.encode(adminPassword));
            usuarioRepository.save(admin);
            System.out.println("🔐 Contraseña del ADMIN reseteada a: " + adminPassword);
        } else {
            System.out.println("✅ Usuario ADMIN verificado correctamente.");
        }
    }

    /**
     * Detecta contraseñas en texto plano y las encripta con BCrypt.
     * Esto corrige usuarios que fueron insertados directamente en la BD con SQL.
     */
    private void fixPlainTextPasswords() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        int fixed = 0;
        for (Usuario u : usuarios) {
            if (u.getPassword() != null && !u.getPassword().startsWith("$2a$")) {
                System.out.println("🔐 Encriptando contraseña para: " + u.getCorreo());
                u.setPassword(passwordEncoder.encode(u.getPassword()));
                usuarioRepository.save(u);
                fixed++;
            }
        }
        if (fixed > 0) {
            System.out.println("✅ Se encriptaron " + fixed + " contraseñas en texto plano.");
        } else {
            System.out.println("✅ Todas las contraseñas ya están encriptadas.");
        }
    }

    private void initializeRoles() {
        List<String> roles = List.of("ADMIN", "CLIENTE");
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
