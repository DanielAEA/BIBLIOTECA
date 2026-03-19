package com.biblioteca.dto;

import java.time.LocalDateTime;

public class PrestamoDTO {
    private Long usuarioId;
    private Long ejemplarId;
    private LocalDateTime fechaPrestamo;
    private LocalDateTime fechaDevolucion;

    public PrestamoDTO() {
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getEjemplarId() {
        return ejemplarId;
    }

    public void setEjemplarId(Long ejemplarId) {
        this.ejemplarId = ejemplarId;
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
}