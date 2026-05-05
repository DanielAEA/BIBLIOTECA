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
    private String isbn;
    private String urlPortada;
    private String urlQr;
    private String codigo;
    private String publicacion;
    private String descripcion;
    private List<EjemplarDTO> ejemplares;

    public LibroDTO(String id, String titulo, List<AutorDTO> autores, EditorialDTO editorial, GeneroDTO genero,
                    int stockDisponible, String archivoDigital, Boolean tieneDigital, String formato,
                    String isbn, String urlPortada, String urlQr, String codigo, String publicacion, String descripcion,
                    List<EjemplarDTO> ejemplares) {
        this.id = id;
        this.titulo = titulo;
        this.autores = autores;
        this.editorial = editorial;
        this.genero = genero;
        this.stockDisponible = stockDisponible;
        this.archivoDigital = archivoDigital;
        this.tieneDigital = tieneDigital;
        this.formato = formato;
        this.isbn = isbn;
        this.urlPortada = urlPortada;
        this.urlQr = urlQr;
        this.codigo = codigo;
        this.publicacion = publicacion;
        this.descripcion = descripcion;
        this.ejemplares = ejemplares;
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
    public String getIsbn() { return isbn; }
    public String getUrlPortada() { return urlPortada; }
    public String getUrlQr() { return urlQr; }
    public String getCodigo() { return codigo; }
    public String getPublicacion() { return publicacion; }
    public String getDescripcion() { return descripcion; }
    public List<EjemplarDTO> getEjemplares() { return ejemplares; }

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

    public static class EjemplarDTO {
        private String id;
        private String codigo;
        private Boolean disponible;
        private String estado;
        public EjemplarDTO(String id, String codigo, Boolean disponible, String estado) {
            this.id = id; this.codigo = codigo; this.disponible = disponible; this.estado = estado;
        }
        public String getId() { return id; }
        public String getCodigo() { return codigo; }
        public Boolean getDisponible() { return disponible; }
        public String getEstado() { return estado; }
    }
}
