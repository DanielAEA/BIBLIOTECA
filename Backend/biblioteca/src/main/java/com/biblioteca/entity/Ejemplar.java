package com.biblioteca.entity;

public class Ejemplar {
    private String id;
    private String codigo;
    private Boolean disponible = true;
    private String estado = "DISPONIBLE"; 
    private String bloque;
    private String estante;

    public Ejemplar() {}

    public Ejemplar(String id, String codigo, Boolean disponible, String estado, String bloque, String estante) {
        this.id = id;
        this.codigo = codigo;
        this.disponible = disponible;
        this.estado = estado;
        this.bloque = bloque;
        this.estante = estante;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Boolean getDisponible() { return disponible; }
    public void setDisponible(Boolean disponible) { this.disponible = disponible; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getBloque() { return bloque; }
    public void setBloque(String bloque) { this.bloque = bloque; }

    public String getEstante() { return estante; }
    public void setEstante(String estante) { this.estante = estante; }
}
