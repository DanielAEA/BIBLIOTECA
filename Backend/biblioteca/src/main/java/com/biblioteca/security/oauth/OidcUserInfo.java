package com.biblioteca.security.oauth;

public class OidcUserInfo {
    private final String provider;
    private final String providerId;
    private final String email;
    private final String name;
    private final boolean emailVerified;

    public OidcUserInfo(String provider, String providerId, String email, String name, boolean emailVerified) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.name = name;
        this.emailVerified = emailVerified;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }
}
