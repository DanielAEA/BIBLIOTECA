package com.biblioteca.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "prestamos")
@CompoundIndexes({
    @CompoundIndex(name = "idx_prestamo_usuario_fecha", def = "{'usuario.$id': 1, 'fechaPrestamo': -1}"),
    @CompoundIndex(name = "idx_prestamo_estado_fecha", def = "{'estado': 1, 'fechaPrestamo': -1}")
})
public class Prestamo {

    @Id
    private String id;

    @DBRef
    private Usuario usuario;

    @DBRef
    private Libro libro; 

    @Indexed
    private String ejemplarCodigo; 

    private String tipoPrestamo = "FISICO";

    private LocalDateTime fechaPrestamo;

    private LocalDateTime fechaDevolucion;

    private LocalDateTime fechaDevolucionReal;

    private Boolean devuelto = false;
    
    
    private String estado = "ACTIVO";

    private Multa multa; 

    public Prestamo() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Libro getLibro() {
        return libro;
    }

    public void setLibro(Libro libro) {
        this.libro = libro;
    }

    public String getEjemplarCodigo() {
        return ejemplarCodigo;
    }

    public void setEjemplarCodigo(String ejemplarCodigo) {
        this.ejemplarCodigo = ejemplarCodigo;
    }

    public String getTipoPrestamo() {
        return tipoPrestamo;
    }

    public void setTipoPrestamo(String tipoPrestamo) {
        this.tipoPrestamo = tipoPrestamo;
    }

    public LocalDateTime getFechaPrestamo() {
        return fechaPrestamo;
    }

    public void setFechaPrestamo(LocalDateTime fechaPrestamo) {
        this.fechaPrestamo = fechaPrestamo;
    }

    public LocalDateTime getFechaDevolucion() {
        return fechaDevolucion;
    }

    public void setFechaDevolucion(LocalDateTime fechaDevolucion) {
        this.fechaDevolucion = fechaDevolucion;
    }

    public LocalDateTime getFechaDevolucionReal() {
        return fechaDevolucionReal;
    }

    public void setFechaDevolucionReal(LocalDateTime fechaDevolucionReal) {
        this.fechaDevolucionReal = fechaDevolucionReal;
    }

    public Boolean getDevuelto() {
        return devuelto;
    }

    public void setDevuelto(Boolean devuelto) {
        this.devuelto = devuelto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Multa getMulta() {
        return multa;
    }

    public void setMulta(Multa multa) {
        this.multa = multa;
    }
}
