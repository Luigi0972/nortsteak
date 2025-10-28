package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // permitir todas las rutas sin login obligatorio
            )
            .formLogin(form -> form
                .loginPage("/login2") // usa tu endpoint /login
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }
}
