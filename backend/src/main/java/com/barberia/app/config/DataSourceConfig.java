package com.barberia.app.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:}")
    private String datasourcePassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String envDbUrl = System.getenv("DATABASE_URL");
        String finalUrl = (envDbUrl != null && !envDbUrl.isBlank()) ? envDbUrl : datasourceUrl;
        String finalUsername = datasourceUsername;
        String finalPassword = datasourcePassword;

        // Soporte para URLs de PostgreSQL en formato URI (ej. Supabase, Render, Railway, Heroku)
        if (finalUrl != null && (finalUrl.startsWith("postgres://") || (finalUrl.startsWith("postgresql://") && !finalUrl.startsWith("jdbc:")))) {
            try {
                URI uri = new URI(finalUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    finalUsername = parts[0];
                    finalPassword = parts[1];
                }

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrl = new StringBuilder();
                jdbcUrl.append("jdbc:postgresql://").append(host).append(":").append(port).append(path != null && !path.isBlank() ? path : "/postgres");

                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                    if (!query.contains("sslmode")) {
                        jdbcUrl.append("&sslmode=require");
                    }
                } else {
                    jdbcUrl.append("?sslmode=require");
                }

                finalUrl = jdbcUrl.toString();
                log.info("Conectando a base de datos PostgreSQL/Supabase: host={}, port={}, db={}", host, port, path);
            } catch (Exception e) {
                log.warn("No se pudo parsear DATABASE_URL como URI, usando URL directa: {}", e.getMessage());
            }
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(finalUrl);

        if (finalUsername != null && !finalUsername.isBlank()) {
            config.setUsername(finalUsername);
        }
        if (finalPassword != null && !finalPassword.isBlank()) {
            config.setPassword(finalPassword);
        }

        if (finalUrl != null && finalUrl.startsWith("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
        } else if (driverClassName != null && !driverClassName.isBlank()) {
            config.setDriverClassName(driverClassName);
        }

        // Parámetros del pool HikariCP optimizados para Supabase y cloud
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
