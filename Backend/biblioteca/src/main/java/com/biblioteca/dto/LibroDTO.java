package com.biblioteca.dto;

import java.util.List;

public class LibroDTO {
    private Long id;
    private String titulo;
    private List<AutorDTO> autores;
    private EditorialDTO editorial;
    private GeneroDTO genero;
    private Integer stockDisponible;
    private String archivoDigital;
    private Boolean tieneDigital;
    private String formato;

    public LibroDTO() {}

    public LibroDTO(Long id, String titulo, List<AutorDTO> autores, EditorialDTO editorial, GeneroDTO genero, Integer stockDisponible, String archivoDigital, Boolean tieneDigital, String formato) {
        this.id = id;
        this.titulo = titulo;
        this.autores = autores;
        this.editorial = editorial;
        this.genero = genero;
        this.stockDisponible = stockDisponible; 
        this.archivoDigital = archivoDigital; 
        this.tieneDigital = tieneDigital != null ? tieneDigital : false;
        this.formato = formato;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public List<AutorDTO> getAutores() {
        return autores;
    }

    public void setAutores(List<AutorDTO> autores) {
        this.autores = autores;
    }

    public EditorialDTO getEditorial() {
        return editorial;
    }

    public void setEditorial(EditorialDTO editorial) {
        this.editorial = editorial;
    }

    public Integer getStockDisponible() {
        return stockDisponible;
    }

    public void setStockDisponible(Integer stockDisponible) {
        this.stockDisponible = stockDisponible;
    }

    public GeneroDTO getGenero() {
        return genero;
    }

    public void setGenero(GeneroDTO genero) {
        this.genero = genero;
    }

    public String getArchivoDigital() {
        return archivoDigital;
    }

    public void setArchivoDigital(String archivoDigital) {
        this.archivoDigital = archivoDigital;
    }

    public Boolean getTieneDigital() {
        return tieneDigital;
    }

    public void setTieneDigital(Boolean tieneDigital) {
        this.tieneDigital = tieneDigital;
    }

    public String getFormato() {
        return formato;
    }

    public void setFormato(String formato) {
        this.formato = formato;
    }

    public static class AutorDTO {
        private Long id;
        private String nombre;

        public AutorDTO() {}

        public AutorDTO(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }

    public static class EditorialDTO {
        private Long id;
        private String nombre;

        public EditorialDTO() {}

        public EditorialDTO(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }

    public static class GeneroDTO {
        private Long id;
        private String nombre;

        public GeneroDTO() {}

        public GeneroDTO(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
    }
}
