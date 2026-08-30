package com.barberia.app.dto;

import java.time.LocalDate;

public class ActividadDiariaDTO {

    private LocalDate fecha;
    private long cantidadCortes;

    public ActividadDiariaDTO() {
    }

    public ActividadDiariaDTO(LocalDate fecha, long cantidadCortes) {
        this.fecha = fecha;
        this.cantidadCortes = cantidadCortes;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public long getCantidadCortes() {
        return cantidadCortes;
    }

    public void setCantidadCortes(long cantidadCortes) {
        this.cantidadCortes = cantidadCortes;
    }
}
