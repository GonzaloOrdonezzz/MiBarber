package com.barberia.app.controller;

import com.barberia.app.dto.EstadisticaMensualDTO;
import com.barberia.app.dto.ResumenSemanalDTO;
import com.barberia.app.model.Corte;
import com.barberia.app.model.EstadoPago;
import com.barberia.app.service.CorteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cortes")
public class CorteController {

    private final CorteService corteService;

    public CorteController(CorteService corteService) {
        this.corteService = corteService;
    }

    // 1. CRUD de Cortes
    @GetMapping
    public ResponseEntity<List<Corte>> obtenerTodos() {
        return ResponseEntity.ok(corteService.obtenerTodos());
    }

    @GetMapping("/dia")
    public ResponseEntity<List<Corte>> obtenerPorFecha(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(corteService.obtenerPorFecha(fecha));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Corte> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(corteService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<Corte> crearCorte(@RequestBody Corte corte) {
        Corte nuevoCorte = corteService.crear(corte);
        return new ResponseEntity<>(nuevoCorte, HttpStatus.CREATED);
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Corte> actualizarCorte(@PathVariable Long id, @RequestBody Corte corte) {
        return ResponseEntity.ok(corteService.actualizar(id, corte));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> eliminarCorte(@PathVariable Long id) {
        corteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // 2. Gestión de Pagos
    @PatchMapping("/{id:\\d+}/pago")
    public ResponseEntity<Corte> cambiarEstadoPago(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String estadoStr = request.get("estadoPago");
        if (estadoStr == null) {
            return ResponseEntity.badRequest().build();
        }
        EstadoPago nuevoEstado = EstadoPago.valueOf(estadoStr.toUpperCase());
        return ResponseEntity.ok(corteService.cambiarEstadoPago(id, nuevoEstado));
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<Corte>> obtenerPendientes() {
        return ResponseEntity.ok(corteService.obtenerPendientes());
    }

    @GetMapping("/deudores")
    public ResponseEntity<List<Corte>> obtenerDeudores() {
        return ResponseEntity.ok(corteService.obtenerDeudores());
    }

    @GetMapping("/pagados")
    public ResponseEntity<List<Corte>> obtenerPagados() {
        return ResponseEntity.ok(corteService.obtenerPagados());
    }

    // 3. Vista y Resumen Semanal
    @GetMapping("/semana")
    public ResponseEntity<ResumenSemanalDTO> obtenerResumenSemanal(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(corteService.obtenerResumenSemanal(fecha));
    }

    // 4. Estadísticas Mensuales y Mapa de Calor Anual
    @GetMapping("/estadisticas/mensuales")
    public ResponseEntity<List<EstadisticaMensualDTO>> obtenerEstadisticasMensuales(
            @RequestParam(required = false) Integer anio) {
        int anioConsulta = (anio != null) ? anio : LocalDate.now().getYear();
        return ResponseEntity.ok(corteService.obtenerEstadisticasMensuales(anioConsulta));
    }

    @GetMapping("/estadisticas/actividad-anual")
    public ResponseEntity<List<com.barberia.app.dto.ActividadDiariaDTO>> obtenerActividadAnual(
            @RequestParam(required = false) Integer anio) {
        int anioConsulta = (anio != null) ? anio : LocalDate.now().getYear();
        return ResponseEntity.ok(corteService.obtenerActividadAnual(anioConsulta));
    }

    // 5. Resumen Global
    @GetMapping("/totales")
    public ResponseEntity<Map<String, BigDecimal>> obtenerTotales() {
        Map<String, BigDecimal> totales = new HashMap<>();
        BigDecimal totalCobrado = corteService.obtenerTotalHistoricoCobrado();
        BigDecimal totalDeuda = corteService.obtenerTotalHistoricoDeuda();
        BigDecimal totalPendiente = corteService.obtenerTotalHistoricoPendiente();
        BigDecimal diezmo = totalCobrado.multiply(new BigDecimal("0.10")).setScale(2, java.math.RoundingMode.HALF_UP);

        totales.put("totalHistoricoCobrado", totalCobrado);
        totales.put("totalHistoricoDeuda", totalDeuda);
        totales.put("totalHistoricoPendiente", totalPendiente);
        totales.put("diezmo", diezmo);
        return ResponseEntity.ok(totales);
    }
}
