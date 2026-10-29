package com.biblioteca.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;

public class ReservaSalaDTO {
    private String salaId;
    private String usuarioId;
    
    
    private Map<String, String> sala;
    private Map<String, String> usuario;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaReserva;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaInicio;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaFin;
    
    private String motivo;

    
    public String getSalaId() { 
        if (salaId != null) return salaId;
        if (sala != null) return sala.get("id");
        return null;
    }
    public void setSalaId(String salaId) { this.salaId = salaId; }

    public String getUsuarioId() { 
        if (usuarioId != null) return usuarioId;
        if (usuario != null) return usuario.get("id");
        return null;
    }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }

    public Map<String, String> getSala() { return sala; }
    public void setSala(Map<String, String> sala) { this.sala = sala; }

    public Map<String, String> getUsuario() { return usuario; }
    public void setUsuario(Map<String, String> usuario) { this.usuario = usuario; }

    public LocalDate getFechaReserva() { return fechaReserva; }
    public void setFechaReserva(LocalDate fechaReserva) { this.fechaReserva = fechaReserva; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}
