package com.biblioteca.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "libros")
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @ManyToMany
    @JoinTable(name = "libro_autores", joinColumns = @JoinColumn(name = "libro_id"), inverseJoinColumns = @JoinColumn(name = "autor_id"))
    @JsonIgnoreProperties("libros")
    private List<Autor> autores;

    @ManyToOne
    @JoinColumn(name = "editorial_id", nullable = false)
    @JsonIgnoreProperties("libros")
    private Editorial editorial;

    @ManyToOne
    @JoinColumn(name = "genero_id", nullable = false)
    @JsonIgnoreProperties("libros")
    private Genero genero;

    @Column(length = 100)
    private String isbn;

    @Column(length = 100)
    private String publicacion;

    @Column(name = "archivo_digital", length = 500)
    private String archivoDigital; // Ruta al archivo PDF

    @Column(name = "tiene_digital")
    private Boolean tieneDigital = false;

    @Column(name = "formato", length = 20)
    private String formato = "FISICO";

    @OneToMany(mappedBy = "libro")
    @JsonIgnoreProperties("libro")
    private List<Ejemplar> ejemplares;

    public Libro() {
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

    public List<Autor> getAutores() {
        return autores;
    }

    public void setAutores(List<Autor> autores) {
        this.autores = autores;
    }

    public Editorial getEditorial() {
        return editorial;
    }

    public void setEditorial(Editorial editorial) {
        this.editorial = editorial;
    }

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
    }

    public List<Ejemplar> getEjemplares() {
        return ejemplares;
    }

    public void setEjemplares(List<Ejemplar> ejemplares) {
        this.ejemplares = ejemplares;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getPublicacion() {
        return publicacion;
    }

    public void setPublicacion(String publicacion) {
        this.publicacion = publicacion;
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
}