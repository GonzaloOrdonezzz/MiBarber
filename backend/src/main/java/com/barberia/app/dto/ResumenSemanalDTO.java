package com.barberia.app.dto;

import com.barberia.app.model.Corte;
import com.barberia.app.model.EstadoPago;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

public class ResumenSemanalDTO {

    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private int totalCortes;
    private int cantidadPagados;
    private int cantidadNoPagados; // Debe
    private int cantidadPendientes; // Turnos pendientes por realizar
    private BigDecimal totalCobrado;
    private BigDecimal diezmo; // 10% del total cobrado
    private BigDecimal totalDeuda; // Monto adeudado (NO_PAGADO)
    private BigDecimal totalPendiente; // Monto en turnos pendientes (PENDIENTE)
    private List<Corte> cortes;

    public ResumenSemanalDTO() {
    }

    public ResumenSemanalDTO(LocalDate fechaInicio, LocalDate fechaFin, List<Corte> cortes, BigDecimal totalCobrado, BigDecimal totalDeuda, BigDecimal totalPendiente) {
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.cortes = cortes;
        this.totalCortes = cortes != null ? cortes.size() : 0;
        this.totalCobrado = totalCobrado != null ? totalCobrado : BigDecimal.ZERO;
        this.totalDeuda = totalDeuda != null ? totalDeuda : BigDecimal.ZERO;
        this.totalPendiente = totalPendiente != null ? totalPendiente : BigDecimal.ZERO;
        this.diezmo = this.totalCobrado.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);

        if (cortes != null) {
            this.cantidadPagados = (int) cortes.stream().filter(c -> c.getEstadoPago() == EstadoPago.PAGADO).count();
            this.cantidadNoPagados = (int) cortes.stream().filter(c -> c.getEstadoPago() == EstadoPago.NO_PAGADO).count();
            this.cantidadPendientes = (int) cortes.stream().filter(c -> c.getEstadoPago() == EstadoPago.PENDIENTE).count();
        }
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public int getTotalCortes() {
        return totalCortes;
    }

    public void setTotalCortes(int totalCortes) {
        this.totalCortes = totalCortes;
    }

    public int getCantidadPagados() {
        return cantidadPagados;
    }

    public void setCantidadPagados(int cantidadPagados) {
        this.cantidadPagados = cantidadPagados;
    }

    public int getCantidadNoPagados() {
        return cantidadNoPagados;
    }

    public void setCantidadNoPagados(int cantidadNoPagados) {
        this.cantidadNoPagados = cantidadNoPagados;
    }

    public int getCantidadPendientes() {
        return cantidadPendientes;
    }

    public void setCantidadPendientes(int cantidadPendientes) {
        this.cantidadPendientes = cantidadPendientes;
    }

    public BigDecimal getTotalCobrado() {
        return totalCobrado;
    }

    public void setTotalCobrado(BigDecimal totalCobrado) {
        this.totalCobrado = totalCobrado;
    }

    public BigDecimal getDiezmo() {
        return diezmo;
    }

    public void setDiezmo(BigDecimal diezmo) {
        this.diezmo = diezmo;
    }

    public BigDecimal getTotalDeuda() {
        return totalDeuda;
    }

    public void setTotalDeuda(BigDecimal totalDeuda) {
        this.totalDeuda = totalDeuda;
    }

    public BigDecimal getTotalPendiente() {
        return totalPendiente;
    }

    public void setTotalPendiente(BigDecimal totalPendiente) {
        this.totalPendiente = totalPendiente;
    }

    public List<Corte> getCortes() {
        return cortes;
    }

    public void setCortes(List<Corte> cortes) {
        this.cortes = cortes;
    }
}
