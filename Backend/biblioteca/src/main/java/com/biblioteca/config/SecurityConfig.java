package com.biblioteca.config;

import com.biblioteca.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;

        @Value("${ALLOWED_ORIGINS:${app.cors.allowed-origins:http://localhost:4200}}")
        private String allowedOrigins;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
                this.jwtAuthFilter = jwtAuthFilter;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http.csrf(AbstractHttpConfigurer::disable)
                                .cors(t -> t.configurationSource(request -> {
                                        CorsConfiguration config = new CorsConfiguration();
                                        config.setAllowCredentials(true);
                                        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
                                                Arrays.stream(allowedOrigins.split(","))
                                                                .map(String::trim)
                                                                .filter(s -> !s.isEmpty())
                                                                .forEach(origin -> {
                                                                        if (origin.contains("*")) {
                                                                                config.addAllowedOriginPattern(origin);
                                                                        } else {
                                                                                config.addAllowedOrigin(origin);
                                                                        }
                                                                });
                                        }
                                        config.addAllowedHeader("*");
                                        config.addAllowedMethod("*");
                                        return config;
                                }))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/auth/**", "/api/auth/**").permitAll()
                                                .requestMatchers("/uploads/**", "/api/prestamos/debug-logs",
                                                                "/api/stats/**",
                                                                "/solicitar/**", "/solicitar-ejemplar/**", "/qr/**",
                                                                "/api/admin/regenerar-qr",
                                                                "/api/libros/download-pdf/**",
                                                                "/api/salas/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/libros").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/libros/*").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/ejemplares/*").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/libros/*/qr").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/libros/*/ejemplares/*/qr")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/solicitudes/nueva").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/prestamos/usuario/**")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/prestamos/**").authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/reservas-sala/**")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.GET, "/api/resenas/**").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/resenas/**",
                                                                "/api/prestamos/**", "/api/reservas-sala/**")
                                                .authenticated()
                                                .requestMatchers(HttpMethod.PUT, "/api/prestamos/**",
                                                                "/api/reservas-sala/**", "/api/resenas/**")
                                                .authenticated()
                                                .requestMatchers("/api/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}