package com.biblioteca.service.impl;

import com.biblioteca.entity.SolicitudPrestamo;
import com.biblioteca.repository.SolicitudRepository;
import com.biblioteca.service.SolicitudService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import com.biblioteca.entity.Libro;
import com.biblioteca.entity.Ejemplar;
import com.biblioteca.entity.Usuario;
import com.biblioteca.entity.Prestamo;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.service.PrestamoService;
import org.springframework.lang.NonNull;

@Service
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final PrestamoService prestamoService;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;

    public SolicitudServiceImpl(SolicitudRepository solicitudRepository,
                                PrestamoService prestamoService,
                                UsuarioRepository usuarioRepository,
                                LibroRepository libroRepository) {
        this.solicitudRepository = solicitudRepository;
        this.prestamoService = prestamoService;
        this.usuarioRepository = usuarioRepository;
        this.libroRepository = libroRepository;
    }

    @Override
    public SolicitudPrestamo crearSolicitud(@NonNull SolicitudPrestamo solicitud) {
        // 1. Verificar si el usuario está registrado
        Usuario usuario = usuarioRepository.findByCorreo(solicitud.getEmailCliente());
        if (usuario == null) {
            throw new RuntimeException("El correo " + solicitud.getEmailCliente() + " no está registrado. Por favor, regístrate primero.");
        }

        // 2. Buscar el libro y ejemplar para validar disponibilidad
        Libro libro = libroRepository.findById(Objects.requireNonNull(solicitud.getLibroId()))
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        
        List<Ejemplar> ejemplares = libro.getEjemplares();
        if (ejemplares == null) throw new RuntimeException("Este libro no tiene ejemplares registrados");

        String codigoEjemplar = solicitud.getCodigoEjemplar();
        if (codigoEjemplar == null || codigoEjemplar.equals("N/A")) {
            // Si no viene código (ej: libroId directo), buscar el primero disponible
            Ejemplar disponible = ejemplares.stream()
                    .filter(e -> Boolean.TRUE.equals(e.getDisponible()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay ejemplares disponibles para este libro"));
            codigoEjemplar = disponible.getCodigo();
        } else {
            // Validar que el ejemplar específico esté disponible
            String finalCodigo = codigoEjemplar;
            Ejemplar e = ejemplares.stream()
                    .filter(ex -> ex.getCodigo().equals(finalCodigo))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Ejemplar no encontrado"));
            if (!Boolean.TRUE.equals(e.getDisponible())) {
                throw new RuntimeException("Este ejemplar ya no está disponible");
            }
        }

        // 3. CREAR EL PRÉSTAMO DIRECTAMENTE (Estado: SOLICITADO)
        // Esto hace que aparezca en la gestión de préstamos del administrador
        Prestamo prestamoNuevo = new Prestamo();
        prestamoNuevo.setUsuario(usuario);
        prestamoNuevo.setLibro(libro);
        prestamoNuevo.setEjemplarCodigo(codigoEjemplar);
        prestamoNuevo.setEstado("SOLICITADO"); // Aparecerá como solicitud pendiente en la tabla de préstamos
        prestamoNuevo.setFechaPrestamo(LocalDateTime.now());
        
        int dias = (solicitud.getDiasPrestamo() != null && solicitud.getDiasPrestamo() > 0) 
                   ? solicitud.getDiasPrestamo() : 15;
        prestamoNuevo.setFechaDevolucion(LocalDateTime.now().plusDays(dias));
        prestamoNuevo.setDevuelto(false);
        
        prestamoService.crear(prestamoNuevo);

        // 4. Guardar también el registro de solicitud (opcional, para histórico)
        solicitud.setEstado("PENDIENTE"); // Cambiado a PENDIENTE para que el admin lo acepte
        solicitud.setFechaSolicitud(LocalDateTime.now());
        return solicitudRepository.save(solicitud);
    }

    @Override
    public List<SolicitudPrestamo> listarTodas() {
        return solicitudRepository.findAll();
    }

    @Override
    public List<SolicitudPrestamo> listarPorEstado(@NonNull String estado) {
        return solicitudRepository.findByEstado(estado);
    }

    @Override
    public SolicitudPrestamo actualizarEstado(@NonNull String id, @NonNull String estado) {
        SolicitudPrestamo solicitud = solicitudRepository.findById(Objects.requireNonNull(id)).orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        solicitud.setEstado(estado);
        return solicitudRepository.save(solicitud);
    }
}
