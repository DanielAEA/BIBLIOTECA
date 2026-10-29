package com.biblioteca.service;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import com.biblioteca.security.oauth.OidcTokenValidatorService;
import com.biblioteca.security.oauth.OidcUserInfo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OidcTokenValidatorService oidcTokenValidatorService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            OidcTokenValidatorService oidcTokenValidatorService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.oidcTokenValidatorService = oidcTokenValidatorService;
    }

    public Map<String, Object> register(Usuario usuario) {
        if (usuarioRepository.findByCorreo(usuario.getCorreo()) != null) {
            throw new RuntimeException("El correo ya está registrado");
        }

        usuario.setRol("CLIENTE");
        usuario.setProveedor("local");
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
        Usuario usuario = usuarioRepository.findByCorreo(email);
        if (usuario != null && (usuario.getPassword() == null || usuario.getPassword().isBlank())) {
            String proveedor = usuario.getProveedor() != null ? usuario.getProveedor() : "Google o Microsoft";
            throw new RuntimeException("Esta cuenta fue creada con inicio de sesión social. Por favor inicia sesión con " + proveedor + ".");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        String token = jwtService.generateToken(usuario);
        return Map.of("token", token);
    }

    public Map<String, Object> loginGoogle(String idToken) {
        OidcUserInfo userInfo = oidcTokenValidatorService.validateGoogleToken(idToken);
        return processSocialLogin(userInfo);
    }

    public Map<String, Object> loginMicrosoft(String idToken) {
        OidcUserInfo userInfo = oidcTokenValidatorService.validateMicrosoftToken(idToken);
        return processSocialLogin(userInfo);
    }

    public Map<String, Object> processSocialLogin(OidcUserInfo userInfo) {
        Usuario usuario = usuarioRepository.findByProveedorAndProveedorId(userInfo.getProvider(), userInfo.getProviderId());
        if (usuario != null) {
            String token = jwtService.generateToken(usuario);
            return Map.of("token", token);
        }

        Usuario usuarioPorCorreo = usuarioRepository.findByCorreo(userInfo.getEmail());
        if (usuarioPorCorreo != null) {
            if ("google".equalsIgnoreCase(userInfo.getProvider())) {
                if (!userInfo.isEmailVerified()) {
                    throw new RuntimeException("El correo de Google no está verificado. No se puede vincular la cuenta.");
                }
                usuarioPorCorreo.setProveedor(userInfo.getProvider());
                usuarioPorCorreo.setProveedorId(userInfo.getProviderId());
                usuarioRepository.save(usuarioPorCorreo);
                String token = jwtService.generateToken(usuarioPorCorreo);
                return Map.of("token", token);
            } else {
                throw new RuntimeException("El correo " + userInfo.getEmail() + " ya está registrado con contraseña. Inicia sesión con tus credenciales habituales.");
            }
        }

        Usuario nuevo = new Usuario();
        nuevo.setNombre(userInfo.getName());
        nuevo.setCorreo(userInfo.getEmail());
        nuevo.setRol("CLIENTE");
        nuevo.setProveedor(userInfo.getProvider());
        nuevo.setProveedorId(userInfo.getProviderId());
        nuevo.setPassword(null);
        nuevo.setFechaRegistro(LocalDateTime.now());

        Usuario guardado = usuarioRepository.save(nuevo);
        String token = jwtService.generateToken(guardado);
        return Map.of("token", token);
    }
}
