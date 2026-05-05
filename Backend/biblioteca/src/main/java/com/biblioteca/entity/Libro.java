package com.biblioteca.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "libros")
public class Libro {

    @Id
    private String id;
    private String titulo;
    
    @DocumentReference(lazy = true)
    private List<Autor> autores; 
    
    @DocumentReference(lazy = true)
    private Editorial editorial; 
    
    @DocumentReference(lazy = true)
    private Genero genero; 
    
    private String isbn;
    private String codigo;
    private String urlPortada;
    private String publicacion;
    private String descripcion;
    private String archivoDigital;
    private Boolean tieneDigital = false;
    private String formato = "FISICO";
    
    private List<Ejemplar> ejemplares; 

    public Libro() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public List<Autor> getAutores() { return autores; }
    public void setAutores(List<Autor> autores) { this.autores = autores; }

    public Editorial getEditorial() { return editorial; }
    public void setEditorial(Editorial editorial) { this.editorial = editorial; }

    public Genero getGenero() { return genero; }
    public void setGenero(Genero genero) { this.genero = genero; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getUrlPortada() { return urlPortada; }
    public void setUrlPortada(String urlPortada) { this.urlPortada = urlPortada; }

    public String getPublicacion() { return publicacion; }
    public void setPublicacion(String publicacion) { this.publicacion = publicacion; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getArchivoDigital() { return archivoDigital; }
    public void setArchivoDigital(String archivoDigital) { this.archivoDigital = archivoDigital; }

    public Boolean getTieneDigital() { return tieneDigital; }
    public void setTieneDigital(Boolean tieneDigital) { this.tieneDigital = tieneDigital; }

    public String getFormato() { return formato; }
    public void setFormato(String formato) { this.formato = formato; }

    public List<Ejemplar> getEjemplares() { return ejemplares; }
    public void setEjemplares(List<Ejemplar> ejemplares) { this.ejemplares = ejemplares; }
}
