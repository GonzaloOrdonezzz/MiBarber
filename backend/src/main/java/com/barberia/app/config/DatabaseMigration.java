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
            // Intentar sintaxis estándar de PostgreSQL
            jdbcTemplate.execute("ALTER TABLE cortes ALTER COLUMN estado_pago TYPE VARCHAR(20)");
            log.info("Migración de base de datos completada (PostgreSQL).");
        } catch (Exception e1) {
            try {
                // Intentar sintaxis H2
                jdbcTemplate.execute("ALTER TABLE cortes ALTER COLUMN estado_pago VARCHAR(20) NOT NULL");
                log.info("Migración de base de datos completada (H2).");
            } catch (Exception e2) {
                log.debug("Ajuste de migración no requerido: {}", e2.getMessage());
            }
        }
    }
}