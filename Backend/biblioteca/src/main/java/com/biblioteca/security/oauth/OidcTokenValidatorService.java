package com.biblioteca.security.oauth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.Date;
import java.util.regex.Pattern;

@Service
public class OidcTokenValidatorService {

    private static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String MS_JWKS_URL = "https://login.microsoftonline.com/common/discovery/v2.0/keys";
    private static final Pattern MS_ISSUER_PATTERN = Pattern.compile("^https://login\\.microsoftonline\\.com/[0-9a-zA-Z.-]+/v2\\.0$");

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${microsoft.client.id:}")
    private String microsoftClientId;

    private ConfigurableJWTProcessor<SecurityContext> googleProcessor;
    private ConfigurableJWTProcessor<SecurityContext> microsoftProcessor;

    public OidcTokenValidatorService() {
    }

    @PostConstruct
    public void validateConfiguration() {
        if (googleClientId == null || googleClientId.trim().isEmpty()) {
            throw new IllegalStateException("Error de configuración: La variable de entorno GOOGLE_CLIENT_ID es obligatoria y no está configurada.");
        }
    }

    public void setGoogleClientId(String googleClientId) {
        this.googleClientId = googleClientId;
    }

    public void setMicrosoftClientId(String microsoftClientId) {
        this.microsoftClientId = microsoftClientId;
    }

    public void setGoogleProcessor(ConfigurableJWTProcessor<SecurityContext> googleProcessor) {
        this.googleProcessor = googleProcessor;
    }

    public void setMicrosoftProcessor(ConfigurableJWTProcessor<SecurityContext> microsoftProcessor) {
        this.microsoftProcessor = microsoftProcessor;
    }

    private synchronized ConfigurableJWTProcessor<SecurityContext> getGoogleProcessor() {
        if (googleProcessor == null) {
            googleProcessor = createProcessor(GOOGLE_JWKS_URL);
        }
        return googleProcessor;
    }

    private synchronized ConfigurableJWTProcessor<SecurityContext> getMicrosoftProcessor() {
        if (microsoftProcessor == null) {
            microsoftProcessor = createProcessor(MS_JWKS_URL);
        }
        return microsoftProcessor;
    }

    private ConfigurableJWTProcessor<SecurityContext> createProcessor(String jwksUrl) {
        try {
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(java.net.URI.create(jwksUrl).toURL());
            JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
            ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
            processor.setJWSKeySelector(keySelector);
            return processor;
        } catch (Exception e) {
            throw new RuntimeException("Error al configurar validador JWKS: " + e.getMessage(), e);
        }
    }

    public OidcUserInfo validateGoogleToken(String idToken) {
        try {
            JWTClaimsSet claims = getGoogleProcessor().process(idToken, null);

            Date now = new Date();
            if (claims.getExpirationTime() == null || claims.getExpirationTime().before(now)) {
                throw new IllegalArgumentException("El token ha expirado");
            }

            String issuer = claims.getIssuer();
            if (!"https://accounts.google.com".equals(issuer) && !"accounts.google.com".equals(issuer)) {
                throw new IllegalArgumentException("Emisor de token inválido");
            }

            if (googleClientId == null || googleClientId.isBlank() || !claims.getAudience().contains(googleClientId)) {
                throw new IllegalArgumentException("Audiencia de token inválida");
            }

            String sub = claims.getSubject();
            String email = claims.getStringClaim("email");
            String name = claims.getStringClaim("name");
            Object verifiedObj = claims.getClaim("email_verified");
            boolean emailVerified = false;
            if (verifiedObj instanceof Boolean) {
                emailVerified = (Boolean) verifiedObj;
            } else if (verifiedObj != null) {
                emailVerified = Boolean.parseBoolean(verifiedObj.toString());
            }

            if (sub == null || sub.isBlank()) {
                throw new IllegalArgumentException("El token no contiene identificador de usuario");
            }
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("El token no contiene correo electrónico");
            }

            return new OidcUserInfo("google", sub, email, name != null ? name : email, emailVerified);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Firma o token de Google inválido: " + e.getMessage(), e);
        }
    }

    public OidcUserInfo validateMicrosoftToken(String idToken) {
        try {
            JWTClaimsSet claims = getMicrosoftProcessor().process(idToken, null);

            Date now = new Date();
            if (claims.getExpirationTime() == null || claims.getExpirationTime().before(now)) {
                throw new IllegalArgumentException("El token ha expirado");
            }

            String issuer = claims.getIssuer();
            if (issuer == null || !MS_ISSUER_PATTERN.matcher(issuer).matches()) {
                throw new IllegalArgumentException("Emisor de Microsoft inválido");
            }

            if (microsoftClientId == null || microsoftClientId.isBlank() || !claims.getAudience().contains(microsoftClientId)) {
                throw new IllegalArgumentException("Audiencia de token inválida");
            }

            String oid = claims.getStringClaim("oid");
            String sub = (oid != null && !oid.isBlank()) ? oid : claims.getSubject();
            if (sub == null || sub.isBlank()) {
                throw new IllegalArgumentException("El token no contiene identificador de usuario");
            }

            String email = claims.getStringClaim("preferred_username");
            if (email == null || email.isBlank()) {
                email = claims.getStringClaim("email");
            }
            if (email == null || email.isBlank()) {
                email = claims.getStringClaim("upn");
            }
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("El token no contiene correo electrónico");
            }

            String name = claims.getStringClaim("name");

            return new OidcUserInfo("microsoft", sub, email, name != null ? name : email, false);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Firma o token de Microsoft inválido: " + e.getMessage(), e);
        }
    }
}
