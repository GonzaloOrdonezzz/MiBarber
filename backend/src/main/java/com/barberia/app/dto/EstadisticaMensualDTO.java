package com.barberia.app.dto;

import java.math.BigDecimal;

public class EstadisticaMensualDTO {

    private int mes;
    private String nombreMes;
    private int anio;
    private int cantidadCortes;
    private BigDecimal ingresosTotales;
    private BigDecimal totalPendiente;

    public EstadisticaMensualDTO() {
    }

    public EstadisticaMensualDTO(int mes, String nombreMes, int anio, int cantidadCortes, BigDecimal ingresosTotales, BigDecimal totalPendiente) {
        this.mes = mes;
        this.nombreMes = nombreMes;
        this.anio = anio;
        this.cantidadCortes = cantidadCortes;
        this.ingresosTotales = ingresosTotales != null ? ingresosTotales : BigDecimal.ZERO;
        this.totalPendiente = totalPendiente != null ? totalPendiente : BigDecimal.ZERO;
    }

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public String getNombreMes() {
        return nombreMes;
    }

    public void setNombreMes(String nombreMes) {
        this.nombreMes = nombreMes;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public int getCantidadCortes() {
        return cantidadCortes;
    }

    public void setCantidadCortes(int cantidadCortes) {
        this.cantidadCortes = cantidadCortes;
    }

    public BigDecimal getIngresosTotales() {
        return ingresosTotales;
    }

    public void setIngresosTotales(BigDecimal ingresosTotales) {
        this.ingresosTotales = ingresosTotales;
    }

    public BigDecimal getTotalPendiente() {
        return totalPendiente;
    }

    public void setTotalPendiente(BigDecimal totalPendiente) {
        this.totalPendiente = totalPendiente;
    }
}
