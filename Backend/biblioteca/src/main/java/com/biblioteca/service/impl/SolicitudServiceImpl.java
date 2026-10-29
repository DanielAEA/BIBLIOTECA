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
        String email = solicitud.getEmailCliente();
        if (email == null || email.isBlank()) {
            email = solicitud.getUsuarioUsername();
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("El correo del cliente es requerido.");
        }

        Usuario usuario = usuarioRepository.findByCorreo(email);
        if (usuario == null) {
            throw new RuntimeException("El correo " + email + " no está registrado. Por favor, regístrate primero.");
        }

        Libro libro = null;
        if (solicitud.getLibroId() != null) {
            libro = libroRepository.findById(Objects.requireNonNull(solicitud.getLibroId()))
                    .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        } else if (solicitud.getEjemplarId() != null) {
            libro = libroRepository.findByEjemplarId(Objects.requireNonNull(solicitud.getEjemplarId()))
                    .orElseThrow(() -> new RuntimeException("Ejemplar no encontrado o no asociado a un libro"));
        }

        if (libro == null) {
            throw new RuntimeException("Debe proporcionar libroId o ejemplarId");
        }

        List<Ejemplar> ejemplares = libro.getEjemplares();
        if (ejemplares == null || ejemplares.isEmpty())
            throw new RuntimeException("Este libro no tiene ejemplares registrados");

        String codigoEjemplar = solicitud.getCodigoEjemplar();
        String ejemplarId = solicitud.getEjemplarId();

        if (ejemplarId != null && !ejemplarId.isBlank()) {
            final String finalEjemplarId = ejemplarId;
            Ejemplar e = ejemplares.stream()
                    .filter(ex -> ex.getId().equals(finalEjemplarId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Ejemplar no encontrado"));
            if (!Boolean.TRUE.equals(e.getDisponible())) {
                throw new RuntimeException("Este ejemplar ya no está disponible");
            }
            codigoEjemplar = e.getCodigo();
        } else if (codigoEjemplar == null || codigoEjemplar.equals("N/A") || codigoEjemplar.isBlank()) {

            Ejemplar disponible = ejemplares.stream()
                    .filter(e -> Boolean.TRUE.equals(e.getDisponible()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No hay ejemplares disponibles para este libro"));
            codigoEjemplar = disponible.getCodigo();
            ejemplarId = disponible.getId();
        } else {

            final String finalCodigo = codigoEjemplar;
            Ejemplar e = ejemplares.stream()
                    .filter(ex -> ex.getCodigo().equals(finalCodigo))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Ejemplar no encontrado"));
            if (!Boolean.TRUE.equals(e.getDisponible())) {
                throw new RuntimeException("Este ejemplar ya no está disponible");
            }
            ejemplarId = e.getId();
        }

        Prestamo prestamoNuevo = new Prestamo();
        prestamoNuevo.setUsuario(usuario);
        prestamoNuevo.setLibro(libro);
        prestamoNuevo.setEjemplarCodigo(codigoEjemplar);
        prestamoNuevo.setEstado("SOLICITADO");
        prestamoNuevo.setFechaPrestamo(LocalDateTime.now());

        int dias = (solicitud.getDiasPrestamo() != null && solicitud.getDiasPrestamo() > 0)
                ? solicitud.getDiasPrestamo()
                : 15;
        prestamoNuevo.setFechaDevolucion(LocalDateTime.now().plusDays(dias));
        prestamoNuevo.setDevuelto(false);

        prestamoService.crear(prestamoNuevo);

        solicitud.setLibroId(libro.getId());
        solicitud.setTituloLibro(libro.getTitulo());
        solicitud.setNombreCliente(usuario.getNombre());
        solicitud.setEmailCliente(usuario.getCorreo());
        solicitud.setEjemplarId(ejemplarId);
        solicitud.setCodigoEjemplar(codigoEjemplar);
        solicitud.setEstado("PENDIENTE");
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
        SolicitudPrestamo solicitud = solicitudRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        solicitud.setEstado(estado);
        return solicitudRepository.save(solicitud);
    }
}
