package com.biblioteca.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "editoriales")
public class Editorial {

    @Id
    private String id;

    private String nombre;

    @JsonIgnore
    private List<String> libroIds;

    public Editorial() {
    }

    public Editorial(String nombre) {
        this.nombre = nombre;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public List<String> getLibroIds() {
        return libroIds;
    }

    public void setLibroIds(List<String> libroIds) {
        this.libroIds = libroIds;
    }
}