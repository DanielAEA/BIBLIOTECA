package com.biblioteca.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "solicitudes")
public class SolicitudPrestamo {
    
    @Id
    private String id;
    private String libroId;
    private String tituloLibro;
    private String nombreCliente;
    private String emailCliente;
    private String estado;
    private String ejemplarId;
    private String codigoEjemplar;
    private LocalDateTime fechaSolicitud;
    private Integer diasPrestamo;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLibroId() { return libroId; }
    public void setLibroId(String libroId) { this.libroId = libroId; }

    public String getEjemplarId() { return ejemplarId; }
    public void setEjemplarId(String ejemplarId) { this.ejemplarId = ejemplarId; }

    public String getCodigoEjemplar() { return codigoEjemplar; }
    public void setCodigoEjemplar(String codigoEjemplar) { this.codigoEjemplar = codigoEjemplar; }

    public String getTituloLibro() { return tituloLibro; }
    public void setTituloLibro(String tituloLibro) { this.tituloLibro = tituloLibro; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getEmailCliente() { return emailCliente; }
    public void setEmailCliente(String emailCliente) { this.emailCliente = emailCliente; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaSolicitud() { return fechaSolicitud; }
    public void setFechaSolicitud(LocalDateTime fechaSolicitud) { this.fechaSolicitud = fechaSolicitud; }

    public Integer getDiasPrestamo() { return diasPrestamo; }
    public void setDiasPrestamo(Integer diasPrestamo) { this.diasPrestamo = diasPrestamo; }
}
