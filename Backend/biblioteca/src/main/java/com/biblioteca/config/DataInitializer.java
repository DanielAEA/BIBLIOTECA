package com.biblioteca.config;

import com.biblioteca.entity.PrecioMulta;
import com.biblioteca.entity.RolUsuario;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.PrecioMultaRepository;
import com.biblioteca.repository.RolUsuarioRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolUsuarioRepository rolUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PrecioMultaRepository precioMultaRepository;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.test.email:}")
    private String testEmail;

    @Value("${app.test.password:}")
    private String testPassword;

    public DataInitializer(
            RolUsuarioRepository rolUsuarioRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            PrecioMultaRepository precioMultaRepository) {
        this.rolUsuarioRepository = rolUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.precioMultaRepository = precioMultaRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeUsers();
        initializePrecioMulta();
        fixPlainTextPasswords();
    }

    private void initializePrecioMulta() {
        if (precioMultaRepository.count() == 0) {
            PrecioMulta precio = new PrecioMulta();
            precio.setValorPorDia(2000.0);
            precio.setVigenteDesde(LocalDate.now().minusYears(1));
            precioMultaRepository.save(precio);
            System.out.println(">>> Precio de multa inicial (2000.0) creado satisfactoriamente.");
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

            // Usuario ADMIN inicial
            if (adminEmail != null && !adminEmail.isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setCorreo(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRol(rolAdmin);
                usuarioRepository.save(admin);
                System.out.println(">>> Usuario ADMIN inicial creado satisfactoriamente.");
            }

            // Usuario PRUEBA inicial
            if (testEmail != null && !testEmail.isEmpty()) {
                Usuario prueba = new Usuario();
                prueba.setNombre("Usuario Prueba");
                prueba.setCorreo(testEmail);
                prueba.setPassword(passwordEncoder.encode(testPassword));
                prueba.setRol(rolCliente);
                usuarioRepository.save(prueba);
                System.out.println(">>> Usuario PRUEBA inicial creado satisfactoriamente.");
            }
        }
    }
}
