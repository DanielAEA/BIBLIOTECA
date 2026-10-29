package com.biblioteca.dto;

public class SocialLoginRequest {
    private String idToken;

    public SocialLoginRequest() {
    }

    public SocialLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
