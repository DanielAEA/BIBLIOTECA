package com.biblioteca.entity;

public class Multa {
    // Embebido en Prestamo
    
    private String id;

    private Integer diasAtraso;

    private Double total;

    private Boolean pagada = false;

    public Multa() {}

    public Multa(Integer diasAtraso, Double total) {
        this.diasAtraso = diasAtraso;
        this.total = total;
        this.pagada = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getDiasAtraso() {
        return diasAtraso;
    }

    public void setDiasAtraso(Integer diasAtraso) {
        this.diasAtraso = diasAtraso;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Boolean getPagada() {
        return pagada;
    }

    public void setPagada(Boolean pagada) {
        this.pagada = pagada;
    }
}