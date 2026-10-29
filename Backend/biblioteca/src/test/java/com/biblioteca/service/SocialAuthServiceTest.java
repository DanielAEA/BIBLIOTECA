package com.biblioteca.service;

import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import com.biblioteca.security.oauth.OidcTokenValidatorService;
import com.biblioteca.security.oauth.OidcUserInfo;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SocialAuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private ConfigurableJWTProcessor<SecurityContext> mockGoogleProcessor;

    @Mock
    private ConfigurableJWTProcessor<SecurityContext> mockMicrosoftProcessor;

    private OidcTokenValidatorService oidcTokenValidatorService;
    private AuthService authService;

    private final String GOOGLE_CLIENT_ID = "test-google-client-id";
    private final String MS_CLIENT_ID = "test-ms-client-id";

    @BeforeEach
    void setUp() {
        oidcTokenValidatorService = new OidcTokenValidatorService();
        oidcTokenValidatorService.setGoogleClientId(GOOGLE_CLIENT_ID);
        oidcTokenValidatorService.setMicrosoftClientId(MS_CLIENT_ID);
        oidcTokenValidatorService.setGoogleProcessor(mockGoogleProcessor);
        oidcTokenValidatorService.setMicrosoftProcessor(mockMicrosoftProcessor);

        authService = new AuthService(
                usuarioRepository,
                passwordEncoder,
                jwtService,
                authenticationManager,
                oidcTokenValidatorService
        );
    }

    @Test
    void testValidateGoogleToken_Success() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("https://accounts.google.com")
                .audience(GOOGLE_CLIENT_ID)
                .subject("google-sub-123")
                .claim("email", "usuario@gmail.com")
                .claim("name", "Usuario Google")
                .claim("email_verified", true)
                .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                .build();

        when(mockGoogleProcessor.process(any(String.class), any())).thenReturn(claims);

        OidcUserInfo userInfo = oidcTokenValidatorService.validateGoogleToken("dummy-id-token");

        assertNotNull(userInfo);
        assertEquals("google", userInfo.getProvider());
        assertEquals("google-sub-123", userInfo.getProviderId());
        assertEquals("usuario@gmail.com", userInfo.getEmail());
        assertEquals("Usuario Google", userInfo.getName());
        assertTrue(userInfo.isEmailVerified());
    }

    @Test
    void testValidateGoogleToken_InvalidAudience() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("https://accounts.google.com")
                .audience("wrong-client-id")
                .subject("google-sub-123")
                .claim("email", "usuario@gmail.com")
                .claim("email_verified", true)
                .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                .build();

        when(mockGoogleProcessor.process(any(String.class), any())).thenReturn(claims);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                oidcTokenValidatorService.validateGoogleToken("dummy-id-token")
        );
        assertTrue(ex.getMessage().contains("Audiencia"));
    }

    @Test
    void testValidateGoogleToken_ExpiredToken() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("https://accounts.google.com")
                .audience(GOOGLE_CLIENT_ID)
                .subject("google-sub-123")
                .claim("email", "usuario@gmail.com")
                .claim("email_verified", true)
                .expirationTime(new Date(System.currentTimeMillis() - 3600000))
                .build();

        when(mockGoogleProcessor.process(any(String.class), any())).thenReturn(claims);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                oidcTokenValidatorService.validateGoogleToken("dummy-id-token")
        );
        assertTrue(ex.getMessage().contains("expirado"));
    }

    @Test
    void testValidateMicrosoftToken_Success() throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer("https://login.microsoftonline.com/common-tenant/v2.0")
                .audience(MS_CLIENT_ID)
                .subject("ms-sub-789")
                .claim("oid", "ms-oid-456")
                .claim("preferred_username", "usuario@outlook.com")
                .claim("name", "Usuario Microsoft")
                .expirationTime(new Date(System.currentTimeMillis() + 3600000))
                .build();

        when(mockMicrosoftProcessor.process(any(String.class), any())).thenReturn(claims);

        OidcUserInfo userInfo = oidcTokenValidatorService.validateMicrosoftToken("dummy-id-token");

        assertNotNull(userInfo);
        assertEquals("microsoft", userInfo.getProvider());
        assertEquals("ms-oid-456", userInfo.getProviderId());
        assertEquals("usuario@outlook.com", userInfo.getEmail());
        assertEquals("Usuario Microsoft", userInfo.getName());
    }

    @Test
    void testProcessSocialLogin_NewUser_GetsRoleCliente() {
        OidcUserInfo userInfo = new OidcUserInfo("google", "sub-new", "nuevo@gmail.com", "Nuevo Usuario", true);
        when(usuarioRepository.findByProveedorAndProveedorId("google", "sub-new")).thenReturn(null);
        when(usuarioRepository.findByCorreo("nuevo@gmail.com")).thenReturn(null);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> {
            Usuario u = i.getArgument(0);
            u.setId("mongo-id-1");
            return u;
        });
        when(jwtService.generateToken(any(Usuario.class))).thenReturn("jwt-token-cliente");

        Map<String, Object> response = authService.processSocialLogin(userInfo);

        assertEquals("jwt-token-cliente", response.get("token"));

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario saved = captor.getValue();
        assertEquals("CLIENTE", saved.getRol());
        assertEquals("google", saved.getProveedor());
        assertEquals("sub-new", saved.getProveedorId());
        assertNull(saved.getPassword());
        assertEquals("nuevo@gmail.com", saved.getCorreo());
    }

    @Test
    void testProcessSocialLogin_ExistingSocialUser_ReturnsToken() {
        Usuario existing = new Usuario();
        existing.setId("user-1");
        existing.setCorreo("existente@gmail.com");
        existing.setRol("CLIENTE");
        existing.setProveedor("google");
        existing.setProveedorId("sub-existing");

        when(usuarioRepository.findByProveedorAndProveedorId("google", "sub-existing")).thenReturn(existing);
        when(jwtService.generateToken(existing)).thenReturn("existing-jwt");

        OidcUserInfo userInfo = new OidcUserInfo("google", "sub-existing", "existente@gmail.com", "Existente", true);
        Map<String, Object> response = authService.processSocialLogin(userInfo);

        assertEquals("existing-jwt", response.get("token"));
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void testProcessSocialLogin_Google_LinksExistingPasswordUser_WhenEmailVerified() {
        Usuario existingLocal = new Usuario();
        existingLocal.setId("local-1");
        existingLocal.setCorreo("link@gmail.com");
        existingLocal.setPassword("bcrypt-hash");
        existingLocal.setRol("CLIENTE");
        existingLocal.setProveedor("local");

        when(usuarioRepository.findByProveedorAndProveedorId("google", "sub-link")).thenReturn(null);
        when(usuarioRepository.findByCorreo("link@gmail.com")).thenReturn(existingLocal);
        when(usuarioRepository.save(existingLocal)).thenReturn(existingLocal);
        when(jwtService.generateToken(existingLocal)).thenReturn("linked-jwt");

        OidcUserInfo userInfo = new OidcUserInfo("google", "sub-link", "link@gmail.com", "Link User", true);
        Map<String, Object> response = authService.processSocialLogin(userInfo);

        assertEquals("linked-jwt", response.get("token"));
        assertEquals("google", existingLocal.getProveedor());
        assertEquals("sub-link", existingLocal.getProveedorId());
        verify(usuarioRepository).save(existingLocal);
    }

    @Test
    void testProcessSocialLogin_Google_Rejects_WhenEmailNotVerified() {
        Usuario existingLocal = new Usuario();
        existingLocal.setCorreo("unverified@gmail.com");

        when(usuarioRepository.findByProveedorAndProveedorId("google", "sub-unverified")).thenReturn(null);
        when(usuarioRepository.findByCorreo("unverified@gmail.com")).thenReturn(existingLocal);

        OidcUserInfo userInfo = new OidcUserInfo("google", "sub-unverified", "unverified@gmail.com", "User", false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.processSocialLogin(userInfo)
        );
        assertTrue(ex.getMessage().contains("no está verificado"));
    }

    @Test
    void testProcessSocialLogin_Microsoft_Rejects_WhenExistingPasswordUser() {
        Usuario existingLocal = new Usuario();
        existingLocal.setCorreo("ms-existente@outlook.com");
        existingLocal.setPassword("bcrypt-hash");

        when(usuarioRepository.findByProveedorAndProveedorId("microsoft", "ms-oid-999")).thenReturn(null);
        when(usuarioRepository.findByCorreo("ms-existente@outlook.com")).thenReturn(existingLocal);

        OidcUserInfo userInfo = new OidcUserInfo("microsoft", "ms-oid-999", "ms-existente@outlook.com", "User", false);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.processSocialLogin(userInfo)
        );
        assertTrue(ex.getMessage().contains("ya está registrado con contraseña"));
    }

    @Test
    void testLogin_PasswordLogin_RejectsSocialUserWithoutPassword() {
        Usuario socialUser = new Usuario();
        socialUser.setCorreo("social@gmail.com");
        socialUser.setPassword(null);
        socialUser.setProveedor("google");

        when(usuarioRepository.findByCorreo("social@gmail.com")).thenReturn(socialUser);

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.login("social@gmail.com", "any-password")
        );
        assertTrue(ex.getMessage().contains("inicio de sesión social"));
        verify(authenticationManager, never()).authenticate(any());
    }
}
