package com.biblioteca.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prestamos")
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties("prestamos")
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ejemplar_id")
    @JsonIgnoreProperties("prestamos")
    private Ejemplar ejemplar;

    @Column(name = "fecha_prestamo", nullable = false)
    private LocalDateTime fechaPrestamo;

    @Column(name = "fecha_devolucion", nullable = false)
    private LocalDateTime fechaDevolucion;

    @Column(name = "fecha_devolucion_real")
    private LocalDateTime fechaDevolucionReal;

    private Boolean devuelto = false;

    @OneToOne(mappedBy = "prestamo", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("prestamo")
    private Multa multa;

    public Prestamo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Ejemplar getEjemplar() { return ejemplar; }
    public void setEjemplar(Ejemplar ejemplar) { this.ejemplar = ejemplar; }
    public LocalDateTime getFechaPrestamo() { return fechaPrestamo; }
    public void setFechaPrestamo(LocalDateTime fechaPrestamo) { this.fechaPrestamo = fechaPrestamo; }
    public LocalDateTime getFechaDevolucion() { return fechaDevolucion; }
    public void setFechaDevolucion(LocalDateTime fechaDevolucion) { this.fechaDevolucion = fechaDevolucion; }
    public LocalDateTime getFechaDevolucionReal() { return fechaDevolucionReal; }
    public void setFechaDevolucionReal(LocalDateTime fechaDevolucionReal) { this.fechaDevolucionReal = fechaDevolucionReal; }
    public Boolean getDevuelto() { return devuelto; }
    public void setDevuelto(Boolean devuelto) { this.devuelto = devuelto; }
    public Multa getMulta() { return multa; }
    public void setMulta(Multa multa) { this.multa = multa; }
}