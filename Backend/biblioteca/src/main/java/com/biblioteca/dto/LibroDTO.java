package com.biblioteca.dto;

import java.util.List;

public class LibroDTO {
    private String id;
    private String titulo;
    private List<AutorDTO> autores;
    private EditorialDTO editorial;
    private GeneroDTO genero;
    private int stockDisponible;
    private String archivoDigital;
    private Boolean tieneDigital;
    private String formato;

    public LibroDTO(String id, String titulo, List<AutorDTO> autores, EditorialDTO editorial, GeneroDTO genero, int stockDisponible, String archivoDigital, Boolean tieneDigital, String formato) {
        this.id = id;
        this.titulo = titulo;
        this.autores = autores;
        this.editorial = editorial;
        this.genero = genero;
        this.stockDisponible = stockDisponible;
        this.archivoDigital = archivoDigital;
        this.tieneDigital = tieneDigital;
        this.formato = formato;
    }

    public String getId() { return id; }
    public String getTitulo() { return titulo; }
    public List<AutorDTO> getAutores() { return autores; }
    public EditorialDTO getEditorial() { return editorial; }
    public GeneroDTO getGenero() { return genero; }
    public int getStockDisponible() { return stockDisponible; }
    public String getArchivoDigital() { return archivoDigital; }
    public Boolean getTieneDigital() { return tieneDigital; }
    public String getFormato() { return formato; }

    public static class AutorDTO {
        private String id;
        private String nombre;
        public AutorDTO(String id, String nombre) { this.id = id; this.nombre = nombre; }
        public String getId() { return id; }
        public String getNombre() { return nombre; }
    }

    public static class EditorialDTO {
        private String id;
        private String nombre;
        public EditorialDTO(String id, String nombre) { this.id = id; this.nombre = nombre; }
        public String getId() { return id; }
        public String getNombre() { return nombre; }
    }

    public static class GeneroDTO {
        private String id;
        private String nombre;
        public GeneroDTO(String id, String nombre) { this.id = id; this.nombre = nombre; }
        public String getId() { return id; }
        public String getNombre() { return nombre; }
    }
}