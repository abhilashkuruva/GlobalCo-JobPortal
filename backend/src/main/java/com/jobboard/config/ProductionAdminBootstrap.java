package com.jobboard.config;

import com.jobboard.entity.Role;
import com.jobboard.entity.User;
import com.jobboard.repository.RoleRepository;
import com.jobboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("prod")
public class ProductionAdminBootstrap {
    @Bean
    CommandLineRunner bootstrapAdmin(UserRepository users, RoleRepository roles, PasswordEncoder passwordEncoder,
                                     @Value("${BOOTSTRAP_ADMIN_USERNAME:}") String username,
                                     @Value("${BOOTSTRAP_ADMIN_EMAIL:}") String email,
                                     @Value("${BOOTSTRAP_ADMIN_PASSWORD:}") String password) {
        return args -> {
            if (username.isBlank() || email.isBlank() || password.isBlank() || users.existsByUsername(username) || users.existsByEmail(email)) {
                return;
            }
            Role role = roles.findByName("ROLE_ADMIN").orElseGet(() -> {
                Role created = new Role();
                created.setName("ROLE_ADMIN");
                return roles.save(created);
            });
            User admin = new User();
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setFirstName("Platform");
            admin.setLastName("Administrator");
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(role);
            admin.setEnabled(true);
            admin.setAccountStatus("APPROVED");
            users.save(admin);
        };
    }
}
