package com.biblioteca.dto;

public class UsuarioDTO {
    private String id;
    private String nombre;
    private String correo;
    private String rol;

    public UsuarioDTO(String id, String nombre, String correo, String rol) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
    }

    public String getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getRol() { return rol; }
}