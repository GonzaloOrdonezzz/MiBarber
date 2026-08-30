package com.barberia.app;

import com.barberia.app.model.Corte;
import com.barberia.app.model.EstadoPago;
import com.barberia.app.repository.CorteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver"
})
class BarberiaAppTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CorteRepository corteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        corteRepository.deleteAll();
    }

    @Test
    void testCrearCorteYObtener() throws Exception {
        Corte nuevoCorte = new Corte("Carlos Gomez", LocalDate.now(), LocalTime.of(15, 30), new BigDecimal("5000.00"), EstadoPago.NO_PAGADO);

        mockMvc.perform(post("/api/cortes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoCorte)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.clienteNombre", is("Carlos Gomez")))
                .andExpect(jsonPath("$.precio", is(5000.00)))
                .andExpect(jsonPath("$.estadoPago", is("NO_PAGADO")));

        mockMvc.perform(get("/api/cortes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clienteNombre", is("Carlos Gomez")));
    }

    @Test
    void testCrearCortePendienteYObtenerPorDia() throws Exception {
        LocalDate fecha = LocalDate.of(2026, 8, 29);
        Corte nuevoCorte = new Corte("Cliente Reserva", fecha, LocalTime.of(16, 0), new BigDecimal("9000.00"), EstadoPago.PENDIENTE);

        mockMvc.perform(post("/api/cortes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevoCorte)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.clienteNombre", is("Cliente Reserva")))
                .andExpect(jsonPath("$.estadoPago", is("PENDIENTE")));

        mockMvc.perform(get("/api/cortes/dia?fecha=2026-08-29"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clienteNombre", is("Cliente Reserva")))
                .andExpect(jsonPath("$[0].estadoPago", is("PENDIENTE")));
    }

    @Test
    void testActualizarYEliminarCorte() throws Exception {
        Corte corte = corteRepository.save(new Corte("Pedro", LocalDate.now(), LocalTime.of(10, 0), new BigDecimal("4000.00"), EstadoPago.NO_PAGADO));

        corte.setClienteNombre("Pedro Actualizado");
        corte.setPrecio(new BigDecimal("4500.00"));

        mockMvc.perform(put("/api/cortes/" + corte.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corte)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clienteNombre", is("Pedro Actualizado")))
                .andExpect(jsonPath("$.precio", is(4500.00)));

        mockMvc.perform(delete("/api/cortes/" + corte.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/cortes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testCambiarEstadoPagoYDeudores() throws Exception {
        Corte c1 = corteRepository.save(new Corte("Marcos", LocalDate.now(), LocalTime.of(11, 0), new BigDecimal("5000.00"), EstadoPago.NO_PAGADO));
        Corte c2 = corteRepository.save(new Corte("Lucas", LocalDate.now(), LocalTime.of(12, 0), new BigDecimal("6000.00"), EstadoPago.PAGADO));

        // Obtener deudores (debe ser Marcos)
        mockMvc.perform(get("/api/cortes/deudores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clienteNombre", is("Marcos")));

        // Cambiar Marcos a PAGADO
        Map<String, String> request = new HashMap<>();
        request.put("estadoPago", "PAGADO");

        mockMvc.perform(patch("/api/cortes/" + c1.getId() + "/pago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPago", is("PAGADO")))
                .andExpect(jsonPath("$.fechaPago", notNullValue()));

        // Ya no hay deudores
        mockMvc.perform(get("/api/cortes/deudores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testResumenSemanalYDiezmo() throws Exception {
        LocalDate hoy = LocalDate.now();
        // 2 cortes pagados ($10,000 total), 1 deudor ($3,000) y 1 pendiente ($4,000)
        corteRepository.save(new Corte("Cliente 1", hoy, LocalTime.of(10, 0), new BigDecimal("6000.00"), EstadoPago.PAGADO));
        corteRepository.save(new Corte("Cliente 2", hoy, LocalTime.of(11, 0), new BigDecimal("4000.00"), EstadoPago.PAGADO));
        corteRepository.save(new Corte("Cliente 3", hoy, LocalTime.of(12, 0), new BigDecimal("3000.00"), EstadoPago.NO_PAGADO));
        corteRepository.save(new Corte("Cliente 4", hoy, LocalTime.of(13, 0), new BigDecimal("4000.00"), EstadoPago.PENDIENTE));

        mockMvc.perform(get("/api/cortes/semana?fecha=" + hoy))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCortes", is(4)))
                .andExpect(jsonPath("$.cantidadPagados", is(2)))
                .andExpect(jsonPath("$.cantidadNoPagados", is(1)))
                .andExpect(jsonPath("$.cantidadPendientes", is(1)))
                .andExpect(jsonPath("$.totalCobrado", is(10000.00)))
                .andExpect(jsonPath("$.diezmo", is(1000.00))) // 10% de 10,000
                .andExpect(jsonPath("$.totalDeuda", is(3000.00)))
                .andExpect(jsonPath("$.totalPendiente", is(4000.00)));

        mockMvc.perform(get("/api/cortes/pendientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].clienteNombre", is("Cliente 4")));

        mockMvc.perform(get("/api/cortes/totales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalHistoricoCobrado", is(10000.00)))
                .andExpect(jsonPath("$.totalHistoricoDeuda", is(3000.00)))
                .andExpect(jsonPath("$.totalHistoricoPendiente", is(4000.00)))
                .andExpect(jsonPath("$.diezmo", is(1000.00)));
    }

    @Test
    void testEstadisticasMensualesYActividadAnual() throws Exception {
        LocalDate hoy = LocalDate.now();
        corteRepository.save(new Corte("Cliente Mes", hoy, LocalTime.of(14, 0), new BigDecimal("5000.00"), EstadoPago.PAGADO));

        mockMvc.perform(get("/api/cortes/estadisticas/mensuales?anio=" + hoy.getYear()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(12)))
                .andExpect(jsonPath("$[?(@.mes == " + hoy.getMonthValue() + ")].cantidadCortes", contains(1)))
                .andExpect(jsonPath("$[?(@.mes == " + hoy.getMonthValue() + ")].ingresosTotales", contains(5000.00)));

        mockMvc.perform(get("/api/cortes/estadisticas/actividad-anual?anio=" + hoy.getYear()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].fecha", is(hoy.toString())))
                .andExpect(jsonPath("$[0].cantidadCortes", is(1)));
    }
}
