package com.biblioteca.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrediccionDTO {

    public static class Request {
        private Integer mes;
        private String categoria;
        private Double previo;
        private Double prom3;

        public Request() {}

        public Request(Integer mes, String categoria) {
            this.mes = mes;
            this.categoria = categoria;
        }

        public Request(Integer mes, String categoria, Double previo, Double prom3) {
            this.mes = mes;
            this.categoria = categoria;
            this.previo = previo;
            this.prom3 = prom3;
        }

        public Integer getMes() { return mes; }
        public void setMes(Integer mes) { this.mes = mes; }

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }

        public Double getPrevio() { return previo; }
        public void setPrevio(Double previo) { this.previo = previo; }

        public Double getProm3() { return prom3; }
        public void setProm3(Double prom3) { this.prom3 = prom3; }
    }

    public static class Response {
        private Integer mes;
        private String categoria;

        @JsonProperty("prediccion_prestamos")
        private Integer prediccionPrestamos;

        @JsonProperty("valor_continuo")
        private Double valorContinuo;

        @JsonProperty("previo")
        private Double previo;

        @JsonProperty("prom3")
        private Double prom3;

        @JsonProperty("total_historico_db")
        private Long totalHistoricoDb;

        @JsonProperty("libros_disponibles_db")
        private Long librosDisponiblesDb;

        @JsonProperty("origen_datos")
        private String origenDatos;

        private String status;

        public Response() {}

        public Integer getMes() { return mes; }
        public void setMes(Integer mes) { this.mes = mes; }

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }

        public Integer getPrediccionPrestamos() { return prediccionPrestamos; }
        public void setPrediccionPrestamos(Integer prediccionPrestamos) { this.prediccionPrestamos = prediccionPrestamos; }

        public Double getValorContinuo() { return valorContinuo; }
        public void setValorContinuo(Double valorContinuo) { this.valorContinuo = valorContinuo; }

        public Double getPrevio() { return previo; }
        public void setPrevio(Double previo) { this.previo = previo; }

        public Double getProm3() { return prom3; }
        public void setProm3(Double prom3) { this.prom3 = prom3; }

        public Long getTotalHistoricoDb() { return totalHistoricoDb; }
        public void setTotalHistoricoDb(Long totalHistoricoDb) { this.totalHistoricoDb = totalHistoricoDb; }

        public Long getLibrosDisponiblesDb() { return librosDisponiblesDb; }
        public void setLibrosDisponiblesDb(Long librosDisponiblesDb) { this.librosDisponiblesDb = librosDisponiblesDb; }

        public String getOrigenDatos() { return origenDatos; }
        public void setOrigenDatos(String origenDatos) { this.origenDatos = origenDatos; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
