package com.biblioteca.dto;

import java.time.LocalDateTime;

public class PrestamoResponseDTO {
    private String id;
    private UsuarioDTO usuario;
    private LibroDTO libro;
    private String ejemplarCodigo;
    private String tipoPrestamo;
    private LocalDateTime fechaPrestamo;
    private LocalDateTime fechaDevolucion;
    private LocalDateTime fechaDevolucionReal;
    private Boolean devuelto;
    private MultaDTO multa;

    public static class UsuarioDTO {
        public String id;
        public String nombre;
        public String correo;
    }

    public static class LibroDTO {
        public String id;
        public String titulo;
        public String isbn;
    }

    public static class MultaDTO {
        public String id;
        public Double total;
        public Integer diasAtraso;
        public Boolean pagada;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public UsuarioDTO getUsuario() { return usuario; }
    public void setUsuario(UsuarioDTO usuario) { this.usuario = usuario; }
    public LibroDTO getLibro() { return libro; }
    public void setLibro(LibroDTO libro) { this.libro = libro; }
    public String getEjemplarCodigo() { return ejemplarCodigo; }
    public void setEjemplarCodigo(String ejemplarCodigo) { this.ejemplarCodigo = ejemplarCodigo; }
    public String getTipoPrestamo() { return tipoPrestamo; }
    public void setTipoPrestamo(String tipoPrestamo) { this.tipoPrestamo = tipoPrestamo; }
    public LocalDateTime getFechaPrestamo() { return fechaPrestamo; }
    public void setFechaPrestamo(LocalDateTime fechaPrestamo) { this.fechaPrestamo = fechaPrestamo; }
    public LocalDateTime getFechaDevolucion() { return fechaDevolucion; }
    public void setFechaDevolucion(LocalDateTime fechaDevolucion) { this.fechaDevolucion = fechaDevolucion; }
    public LocalDateTime getFechaDevolucionReal() { return fechaDevolucionReal; }
    public void setFechaDevolucionReal(LocalDateTime fechaDevolucionReal) { this.fechaDevolucionReal = fechaDevolucionReal; }
    public Boolean getDevuelto() { return devuelto; }
    public void setDevuelto(Boolean devuelto) { this.devuelto = devuelto; }
    public MultaDTO getMulta() { return multa; }
    public void setMulta(MultaDTO multa) { this.multa = multa; }
}
