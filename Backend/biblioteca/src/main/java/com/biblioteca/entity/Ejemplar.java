package com.biblioteca.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

public class Ejemplar {
    // Nota: Ejemplar ya no es una @Document porque se embebe en Libro
    // Pero mantenemos la clase para el tipado.
    
    @Id
    @Field("_id")
    private String id; // Identificador único mapeado a _id de MongoDB

    private String codigo;

    private Boolean disponible = true;

    private String estado = "DISPONIBLE";
    
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("ejemplares")
    private Libro libro;

    public Libro getLibro() {
        return libro;
    }

    public void setLibro(Libro libro) {
        this.libro = libro;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}