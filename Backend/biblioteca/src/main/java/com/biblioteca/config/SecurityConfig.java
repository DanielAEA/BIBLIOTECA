package com.biblioteca.config;

import com.biblioteca.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas totalmente públicas
                        .requestMatchers("/auth/**", "/uploads/**", "/api/prestamos/debug-logs", "/api/stats/config", "/solicitar/**", "/solicitar-ejemplar/**", "/qr/**", "/api/admin/regenerar-qr").permitAll()
                        
                        // 2. Lecturas específicas que DEBEN ser públicas para el escaneo QR
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/libros/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/ejemplares/*").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/libros/*/qr").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/solicitudes/nueva").permitAll()

                        // 3. Lecturas permitidas para usuarios autenticados (el resto de la API)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, 
                                "/api/libros/**", 
                                "/api/autores/**", 
                                "/api/editoriales/**", 
                                "/api/generos/**", 
                                "/api/ejemplares/**", 
                                "/api/salas/**",
                                "/api/resenas/**",
                                "/api/prestamos/**",
                                "/api/reservas-sala/**").authenticated()
                        
                        // 4. Acciones de cliente autenticado
                        .requestMatchers(org.springframework.http.HttpMethod.POST,
                                "/api/resenas/**",
                                "/api/prestamos/**",
                                "/api/reservas-sala/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                "/api/prestamos/**",
                                "/api/reservas-sala/**",
                                "/api/resenas/**").authenticated()
                        
                        // 5. Rutas exclusivas para ADMIN
                        .requestMatchers("/api/**").hasRole("ADMIN")
                        
                        // 6. Cualquier otra cosa requiere autenticación
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
