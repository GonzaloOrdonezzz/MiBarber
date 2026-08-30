package com.barberia.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseMigration.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Ejecutando ajuste de base de datos para habilitar estado_pago PENDIENTE...");
            jdbcTemplate.execute("ALTER TABLE cortes ALTER COLUMN estado_pago VARCHAR(20) NOT NULL");
            log.info("Columna estado_pago migrada a VARCHAR(20) exitosamente.");
        } catch (Exception e) {
            log.info("Ajuste de base de datos finalizado: {}", e.getMessage());
        }
    }
}