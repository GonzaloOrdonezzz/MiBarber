package com.barberia.app.repository;

import com.barberia.app.model.Corte;
import com.barberia.app.model.EstadoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CorteRepository extends JpaRepository<Corte, Long> {

    // Lista de cortes ordenados por fecha y hora descendente
    List<Corte> findAllByOrderByFechaDescHoraDesc();

    // Cortes entre dos fechas (para la vista semanal y filtros por rango)
    List<Corte> findByFechaBetweenOrderByFechaAscHoraAsc(LocalDate fechaInicio, LocalDate fechaFin);

    // Cortes de una fecha específica ordenados por hora
    List<Corte> findByFechaOrderByHoraAsc(LocalDate fecha);

    // Cortes filtrados por estado de pago (ej. todos los deudores o todos los pagados)
    List<Corte> findByEstadoPagoOrderByFechaDescHoraDesc(EstadoPago estadoPago);

    // Cortes filtrados por estado de pago en una semana/rango específico
    List<Corte> findByEstadoPagoAndFechaBetweenOrderByFechaAscHoraAsc(EstadoPago estadoPago, LocalDate fechaInicio, LocalDate fechaFin);

    // Suma de montos por estado de pago en un rango de fechas
    @Query("SELECT COALESCE(SUM(c.precio), 0) FROM Corte c WHERE c.estadoPago = :estadoPago AND c.fecha BETWEEN :fechaInicio AND :fechaFin")
    BigDecimal sumPrecioByEstadoPagoAndFechaBetween(
            @Param("estadoPago") EstadoPago estadoPago,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    // Suma total global por estado de pago (ej. total histórico cobrado o total deuda pendiente)
    @Query("SELECT COALESCE(SUM(c.precio), 0) FROM Corte c WHERE c.estadoPago = :estadoPago")
    BigDecimal sumPrecioByEstadoPago(@Param("estadoPago") EstadoPago estadoPago);

    // Cortes de un mes y año específico
    @Query("SELECT c FROM Corte c WHERE YEAR(c.fecha) = :year AND MONTH(c.fecha) = :month ORDER BY c.fecha ASC, c.hora ASC")
    List<Corte> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    // Conteo de cortes por día en un año para el gráfico de contribuciones
    @Query("SELECT c.fecha, COUNT(c) FROM Corte c WHERE YEAR(c.fecha) = :year GROUP BY c.fecha ORDER BY c.fecha ASC")
    List<Object[]> countCortesByFechaInYear(@Param("year") int year);
}
