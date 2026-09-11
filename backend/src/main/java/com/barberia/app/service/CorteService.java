package com.barberia.app.service;

import com.barberia.app.dto.EstadisticaMensualDTO;
import com.barberia.app.dto.ResumenSemanalDTO;
import com.barberia.app.model.Corte;
import com.barberia.app.model.EstadoPago;
import com.barberia.app.repository.CorteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class CorteService {

    private final CorteRepository corteRepository;

    public CorteService(CorteRepository corteRepository) {
        this.corteRepository = corteRepository;
    }

    // CRUD Básico
    public List<Corte> obtenerTodos() {
        return corteRepository.findAllByOrderByFechaDescHoraDesc();
    }

    public Corte obtenerPorId(Long id) {
        return corteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Corte no encontrado con ID: " + id));
    }

    public List<Corte> obtenerPorFecha(LocalDate fecha) {
        return corteRepository.findByFechaOrderByHoraAsc(fecha != null ? fecha : LocalDate.now());
    }

    @Transactional
    public Corte crear(Corte corte) {
        if (corte.getEstadoPago() == null) {
            corte.setEstadoPago(EstadoPago.PENDIENTE);
        }
        if (corte.getEstadoPago() == EstadoPago.PAGADO && corte.getFechaPago() == null) {
            corte.setFechaPago(LocalDateTime.now());
        }
        return corteRepository.save(corte);
    }

    @Transactional
    public Corte actualizar(Long id, Corte datosActualizados) {
        Corte corteExistente = obtenerPorId(id);

        corteExistente.setClienteNombre(datosActualizados.getClienteNombre());
        corteExistente.setFecha(datosActualizados.getFecha());
        corteExistente.setHora(datosActualizados.getHora());
        corteExistente.setPrecio(datosActualizados.getPrecio());

        if (datosActualizados.getEstadoPago() != null) {
            corteExistente.setEstadoPago(datosActualizados.getEstadoPago());
        }

        return corteRepository.save(corteExistente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!corteRepository.existsById(id)) {
            throw new RuntimeException("Corte no encontrado con ID: " + id);
        }
        corteRepository.deleteById(id);
    }

    // Gestión de Pagos
    @Transactional
    public Corte cambiarEstadoPago(Long id, EstadoPago nuevoEstado) {
        Corte corte = obtenerPorId(id);
        corte.setEstadoPago(nuevoEstado);
        return corteRepository.save(corte);
    }

    public List<Corte> obtenerPendientes() {
        return corteRepository.findByEstadoPagoOrderByFechaAscHoraAsc(EstadoPago.PENDIENTE);
    }

    public List<Corte> obtenerDeudores() {
        return corteRepository.findByEstadoPagoOrderByFechaDescHoraDesc(EstadoPago.NO_PAGADO);
    }

    public List<Corte> obtenerPagados() {
        return corteRepository.findByEstadoPagoOrderByFechaDescHoraDesc(EstadoPago.PAGADO);
    }

    // Vista y Resumen Semanal
    public ResumenSemanalDTO obtenerResumenSemanal(LocalDate fechaReferencia) {
        LocalDate fecha = (fechaReferencia != null) ? fechaReferencia : LocalDate.now();

        // Calcular Domingo a Sábado de la semana correspondiente
        LocalDate inicioSemana = fecha.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY));
        LocalDate finSemana = inicioSemana.plusDays(6);

        List<Corte> cortesSemana = corteRepository.findByFechaBetweenOrderByFechaAscHoraAsc(inicioSemana, finSemana);

        BigDecimal totalCobrado = corteRepository.sumPrecioByEstadoPagoAndFechaBetween(
                EstadoPago.PAGADO, inicioSemana, finSemana);

        BigDecimal totalDeuda = corteRepository.sumPrecioByEstadoPagoAndFechaBetween(
                EstadoPago.NO_PAGADO, inicioSemana, finSemana);

        BigDecimal totalPendiente = corteRepository.sumPrecioByEstadoPagoAndFechaBetween(
                EstadoPago.PENDIENTE, inicioSemana, finSemana);

        return new ResumenSemanalDTO(inicioSemana, finSemana, cortesSemana, totalCobrado, totalDeuda, totalPendiente);
    }

    // Estadísticas Mensuales
    public List<EstadisticaMensualDTO> obtenerEstadisticasMensuales(int anio) {
        List<EstadisticaMensualDTO> estadisticas = new ArrayList<>();
        Locale localeEs = new Locale("es", "ES");

        for (int mes = 1; mes <= 12; mes++) {
            List<Corte> cortesMes = corteRepository.findByYearAndMonth(anio, mes);

            int totalCortes = cortesMes.size();

            BigDecimal ingresosMes = cortesMes.stream()
                    .filter(c -> c.getEstadoPago() == EstadoPago.PAGADO)
                    .map(Corte::getPrecio)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal pendienteMes = cortesMes.stream()
                    .filter(c -> c.getEstadoPago() != EstadoPago.PAGADO)
                    .map(Corte::getPrecio)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String nombreMes = LocalDate.of(anio, mes, 1)
                    .getMonth()
                    .getDisplayName(TextStyle.FULL, localeEs);
            // Capitalizar primera letra
            nombreMes = nombreMes.substring(0, 1).toUpperCase() + nombreMes.substring(1);

            estadisticas.add(new EstadisticaMensualDTO(mes, nombreMes, anio, totalCortes, ingresosMes, pendienteMes));
        }

        return estadisticas;
    }

    // Totales Globales
    public BigDecimal obtenerTotalHistoricoCobrado() {
        return corteRepository.sumPrecioByEstadoPago(EstadoPago.PAGADO);
    }

    public BigDecimal obtenerTotalHistoricoDeuda() {
        return corteRepository.sumPrecioByEstadoPago(EstadoPago.NO_PAGADO);
    }

    public BigDecimal obtenerTotalHistoricoPendiente() {
        return corteRepository.sumPrecioByEstadoPago(EstadoPago.PENDIENTE);
    }

    // Actividad Anual para el gráfico de contribuciones
    public List<com.barberia.app.dto.ActividadDiariaDTO> obtenerActividadAnual(int anio) {
        List<Object[]> resultados = corteRepository.countCortesByFechaInYear(anio);
        List<com.barberia.app.dto.ActividadDiariaDTO> lista = new ArrayList<>();
        for (Object[] fila : resultados) {
            LocalDate fecha = (LocalDate) fila[0];
            long cantidad = ((Number) fila[1]).longValue();
            lista.add(new com.barberia.app.dto.ActividadDiariaDTO(fecha, cantidad));
        }
        return lista;
    }
}
