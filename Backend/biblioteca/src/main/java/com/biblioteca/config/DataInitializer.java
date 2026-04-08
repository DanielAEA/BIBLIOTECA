package com.biblioteca.config;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.test.email:}")
    private String testEmail;

    @Value("${app.test.password:}")
    private String testPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        fixPlainTextPasswords();
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
                logger.info("🔐 Encriptando contraseña para: {}", u.getCorreo());
                u.setPassword(passwordEncoder.encode(u.getPassword()));
                usuarioRepository.save(u);
                fixed++;
            }
        }
        if (fixed > 0) {
            logger.info("✅ Se encriptaron {} contraseñas en texto plano.", fixed);
        }
    }

    private void initializeUsers() {
        // Usuario ADMIN inicial
        if (adminEmail != null && !adminEmail.isEmpty()) {
            if (usuarioRepository.findByCorreo(adminEmail) == null) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador");
                admin.setCorreo(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRol("ADMIN");
                usuarioRepository.save(admin);
                logger.info(">>> Usuario ADMIN ({}) creado satisfactoriamente.", adminEmail);
            }
        }

        // Usuario PRUEBA inicial
        if (testEmail != null && !testEmail.isEmpty()) {
            if (usuarioRepository.findByCorreo(testEmail) == null) {
                Usuario prueba = new Usuario();
                prueba.setNombre("Usuario Prueba");
                prueba.setCorreo(testEmail);
                prueba.setPassword(passwordEncoder.encode(testPassword));
                prueba.setRol("CLIENTE");
                usuarioRepository.save(prueba);
                logger.info(">>> Usuario PRUEBA ({}) creado satisfactoriamente.", testEmail);
            }
        }
    }
}
