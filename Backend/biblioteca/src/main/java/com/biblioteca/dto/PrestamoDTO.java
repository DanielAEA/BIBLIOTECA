package com.biblioteca.dto;

import java.time.LocalDateTime;

public class PrestamoDTO {
    private String usuarioId;
    private String libroId;
    private String ejemplarCodigo;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaPrestamo;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fechaDevolucion;

    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public String getLibroId() { return libroId; }
    public void setLibroId(String libroId) { this.libroId = libroId; }

    public String getEjemplarCodigo() { return ejemplarCodigo; }
    public void setEjemplarCodigo(String ejemplarCodigo) { this.ejemplarCodigo = ejemplarCodigo; }

    public LocalDateTime getFechaPrestamo() { return fechaPrestamo; }
    public void setFechaPrestamo(LocalDateTime fechaPrestamo) { this.fechaPrestamo = fechaPrestamo; }

    public LocalDateTime getFechaDevolucion() { return fechaDevolucion; }
    public void setFechaDevolucion(LocalDateTime fechaDevolucion) { this.fechaDevolucion = fechaDevolucion; }
}