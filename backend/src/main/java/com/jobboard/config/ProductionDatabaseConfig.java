package com.jobboard.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Profile("prod")
public class ProductionDatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(ProductionDatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String rawUrl,
            @Value("${spring.datasource.username:}") String configuredUsername,
            @Value("${spring.datasource.password:}") String configuredPassword) {

        String jdbcUrl = rawUrl.trim();
        String effectiveUsername = configuredUsername != null ? configuredUsername.trim() : "";
        String effectivePassword = configuredPassword != null ? configuredPassword.trim() : "";

        try {
            // Strip leading "jdbc:" if present to parse with standard URI
            String uriString = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring(5) : jdbcUrl;
            if (uriString.startsWith("postgresql://") || uriString.startsWith("postgres://")) {
                URI uri = URI.create(uriString);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    if (effectiveUsername.isBlank() && parts.length > 0) {
                        effectiveUsername = parts[0];
                    }
                    if (effectivePassword.isBlank() && parts.length > 1) {
                        effectivePassword = parts[1];
                    }
                }

                // Reconstruct clean JDBC URL without credentials
                StringBuilder cleanUrl = new StringBuilder("jdbc:postgresql://");
                cleanUrl.append(uri.getHost());
                if (uri.getPort() > 0) {
                    cleanUrl.append(":").append(uri.getPort());
                }
                if (uri.getPath() != null) {
                    cleanUrl.append(uri.getPath());
                }
                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    cleanUrl.append("?").append(uri.getQuery());
                }
                jdbcUrl = cleanUrl.toString();
                log.info("Sanitized database JDBC URL for PostgreSQL: {}", jdbcUrl);
            }
        } catch (Exception e) {
            log.warn("Could not parse database URL as URI, using raw URL: {}", e.getMessage());
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");
        if (!effectiveUsername.isBlank()) {
            dataSource.setUsername(effectiveUsername);
        }
        if (!effectivePassword.isBlank()) {
            dataSource.setPassword(effectivePassword);
        }
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(30000);

        return dataSource;
    }
}
