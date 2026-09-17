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
            @Value("${spring.datasource.url:jdbc:postgresql://ep-floral-math-awdrkjeh-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require}") String rawUrl,
            @Value("${spring.datasource.username:${DB_USERNAME:neondb_owner}}") String configuredUsername,
            @Value("${spring.datasource.password:${DB_PASSWORD:npg_xYAb6fekFqS4}}") String configuredPassword) {

        String jdbcUrl = rawUrl != null ? rawUrl.trim() : "";
        String effectiveUsername = configuredUsername != null ? configuredUsername.trim() : "";
        String effectivePassword = configuredPassword != null ? configuredPassword.trim() : "";

        // Fallback from system environment if property was empty string
        if (effectiveUsername.isBlank()) {
            effectiveUsername = System.getenv().getOrDefault("DB_USERNAME", "neondb_owner").trim();
        }
        if (effectivePassword.isBlank()) {
            effectivePassword = System.getenv().getOrDefault("DB_PASSWORD", "npg_xYAb6fekFqS4").trim();
        }

        try {
            // Strip leading "jdbc:" if present to parse with standard URI
            String uriString = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring(5) : jdbcUrl;
            if (uriString.startsWith("postgresql://") || uriString.startsWith("postgres://")) {
                URI uri = URI.create(uriString);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    if (parts.length > 0 && !parts[0].isBlank()) {
                        effectiveUsername = parts[0];
                    }
                    if (parts.length > 1 && !parts[1].isBlank()) {
                        effectivePassword = parts[1];
                    }
                }

                // Reconstruct clean JDBC URL without inline user:password@
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
            }
        } catch (Exception e) {
            log.warn("Could not parse database URL as URI, using as-is: {}", e.getMessage());
        }

        log.info("Configuring HikariDataSource with URL: {}, Username: {}, Password configured: {}",
                jdbcUrl, effectiveUsername, !effectivePassword.isBlank());

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUsername(effectiveUsername);
        dataSource.setPassword(effectivePassword);
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(30000);

        return dataSource;
    }
}
