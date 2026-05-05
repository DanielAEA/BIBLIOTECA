package com.biblioteca.service.impl;

import com.biblioteca.entity.Prestamo;
import com.biblioteca.entity.Usuario;
import com.biblioteca.entity.Libro;
import com.biblioteca.entity.Ejemplar;
import com.biblioteca.entity.Multa;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.service.PrestamoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Service
public class PrestamoServiceImpl implements PrestamoService {

    private static final Logger logger = LoggerFactory.getLogger(PrestamoServiceImpl.class);
    public static final List<String> debugLogs = java.util.Collections.synchronizedList(new java.util.ArrayList<>());
    
    @Override
    public void logDebug(String msg) {
        logger.info(msg);
        debugLogs.add(LocalDateTime.now() + " | " + msg);
        if (debugLogs.size() > 100) debugLogs.remove(0);
    }

    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;
    private static final Double VALOR_MULTA_DIARIA = 2000.0;

    public PrestamoServiceImpl(PrestamoRepository prestamoRepository,
            UsuarioRepository usuarioRepository,
            LibroRepository libroRepository) {
        this.prestamoRepository = prestamoRepository;
        this.usuarioRepository = usuarioRepository;
        this.libroRepository = libroRepository;
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo crear(@NonNull Prestamo prestamo) {
        try {
            logDebug(">>> CREANDO PRESTAMO EN DB...");
            
            if (prestamo.getEstado() == null) prestamo.setEstado("ACTIVO");
            
            Usuario usuario = prestamo.getUsuario();
            Libro libro = prestamo.getLibro();
            String usuarioId = usuario != null ? usuario.getId() : null;
            String libroId = libro != null ? libro.getId() : null;
            String codigoEjemplar = prestamo.getEjemplarCodigo();

            Usuario usuarioReal = usuarioRepository.findById(Objects.requireNonNull(usuarioId, "Usuario ID nulo"))
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            Libro libroReal = libroRepository.findById(Objects.requireNonNull(libroId, "Libro ID nulo"))
                    .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

            
            Ejemplar ejemplarBuscado = null;
            if (libroReal.getEjemplares() != null) {
                for (Ejemplar e : libroReal.getEjemplares()) {
                    if (codigoEjemplar.equals(e.getCodigo())) {
                        if (!Boolean.TRUE.equals(e.getDisponible()) && !"SOLICITADO".equalsIgnoreCase(prestamo.getEstado())) {
                            throw new RuntimeException("Ejemplar " + codigoEjemplar + " no disponible");
                        }
                        e.setDisponible(false); 
                        e.setEstado("PRESTADO");
                        ejemplarBuscado = e;
                        break;
                    }
                }
            }

            if (ejemplarBuscado == null) throw new RuntimeException("Ejemplar " + codigoEjemplar + " no encontrado en el libro");

            
            libroRepository.save(libroReal);
            logDebug(">>> DISPONIBILIDAD ACTUALIZADA EN LIBRO " + libroReal.getTitulo());

            prestamo.setUsuario(usuarioReal);
            prestamo.setLibro(libroReal);
            prestamo.setDevuelto(false);
            if (prestamo.getFechaPrestamo() == null) prestamo.setFechaPrestamo(LocalDateTime.now());
            if (prestamo.getFechaDevolucion() == null) prestamo.setFechaDevolucion(LocalDateTime.now().plusDays(15));

            return prestamoRepository.save(prestamo);

        } catch (Exception e) {
            logDebug(">>> ERROR AL CREAR PRESTAMO: " + e.getMessage());
            throw (e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e));
        }
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo aceptarSolicitud(@NonNull String idPrestamo) {
        Prestamo p = prestamoRepository.findById(Objects.requireNonNull(idPrestamo)).orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        if (!"SOLICITADO".equalsIgnoreCase(p.getEstado())) throw new RuntimeException("Estado inválido");
        
        long durationDias = ChronoUnit.DAYS.between(p.getFechaPrestamo(), p.getFechaDevolucion());
        if (durationDias < 1) durationDias = 15; 
        
        p.setFechaPrestamo(LocalDateTime.now());
        p.setFechaDevolucion(LocalDateTime.now().plusDays(durationDias));
        p.setEstado("ACTIVO");
        
        return prestamoRepository.save(p);
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo rechazarSolicitud(@NonNull String idPrestamo) {
        Prestamo p = prestamoRepository.findById(Objects.requireNonNull(idPrestamo)).orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        if (!"SOLICITADO".equalsIgnoreCase(p.getEstado())) throw new RuntimeException("Estado inválido");
        p.setEstado("RECHAZADO");
        p.setDevuelto(true);
        liberarEjemplar(p); 
        return prestamoRepository.save(p);
    }

    @SuppressWarnings("null")
    private void liberarEjemplar(Prestamo p) {
        if (p.getLibro() == null || p.getEjemplarCodigo() == null) return;
        Libro libro = libroRepository.findById(Objects.requireNonNull(p.getLibro().getId())).orElse(null);
        if (libro != null && libro.getEjemplares() != null) {
            for (Ejemplar e : libro.getEjemplares()) {
                if (p.getEjemplarCodigo().equals(e.getCodigo())) {
                    e.setDisponible(true); 
                    e.setEstado("DISPONIBLE");
                    break;
                }
            }
            libroRepository.save(libro); 
            logDebug(">>> EJEMPLAR LIBERADO EN MONGO PARA EL LIBRO " + libro.getTitulo());
        }
    }

    @Override
    public Prestamo obtenerPorId(@NonNull String id) {
        return prestamoRepository.findById(id).orElse(null);
    }

    @Override
    public List<Prestamo> listar() {
        return prestamoRepository.findAll();
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo actualizar(@NonNull String id, @NonNull Prestamo prestamo) {
        Prestamo existente = prestamoRepository.findById(Objects.requireNonNull(id)).orElseThrow(() -> new RuntimeException("Prestamo no encontrado"));
        if (Boolean.TRUE.equals(prestamo.getDevuelto()) && !Boolean.TRUE.equals(existente.getDevuelto())) {
            existente.setFechaDevolucionReal(LocalDateTime.now());
            existente.setEstado("DEVUELTO");
            liberarEjemplar(existente);
        }
        if (prestamo.getDevuelto() != null) existente.setDevuelto(prestamo.getDevuelto());
        if (prestamo.getEstado() != null) existente.setEstado(prestamo.getEstado());
        return prestamoRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        prestamoRepository.deleteById(Objects.requireNonNull(id));
    }

    @Override
    public List<Prestamo> listarPorUsuario(@NonNull String usuarioId) {
        return prestamoRepository.findByUsuarioId(usuarioId);
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo pagarMulta(@NonNull String idPrestamo) {
        Prestamo p = prestamoRepository.findById(Objects.requireNonNull(idPrestamo))
                .orElseThrow(() -> new RuntimeException("Préstamo no encontrado"));
        
        Multa m = p.getMulta();
        if (m == null) {
            // Si no hay multa formal, calcularla según el retraso actual
            long dias = ChronoUnit.DAYS.between(p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), 
                                             LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
            if (dias > 0) {
                m = new Multa();
                m.setTotal(VALOR_MULTA_DIARIA * (double) dias);
                m.setDiasAtraso((int) dias);
            } else {
                throw new RuntimeException("Este préstamo no tiene multas pendientes.");
            }
        }
        
        m.setPagada(true);
        p.setMulta(m);
        return prestamoRepository.save(p);
    }

    @SuppressWarnings("null")
    @Override
    public Prestamo devolverLibro(@NonNull String idPrestamo) {
        Prestamo p = prestamoRepository.findById(Objects.requireNonNull(idPrestamo)).orElseThrow(() -> new RuntimeException("Prestamo no encontrado"));
        if (Boolean.TRUE.equals(p.getDevuelto())) throw new RuntimeException("Ya fue devuelto");
        p.setDevuelto(true);
        p.setEstado("DEVUELTO");
        p.setFechaDevolucionReal(LocalDateTime.now());
        liberarEjemplar(p);
        long dias = ChronoUnit.DAYS.between(p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
        if (dias > 0) {
            Multa m = new Multa();
            m.setTotal(VALOR_MULTA_DIARIA * (double) dias);
            m.setDiasAtraso((int) dias);
            p.setMulta(m);
        }
        return prestamoRepository.save(p);
    }

    @SuppressWarnings("null")
    @Override
    public void registrarLecturaVirtual(@NonNull String usuarioId, @NonNull String libroId) {
        Usuario u = usuarioRepository.findById(Objects.requireNonNull(usuarioId)).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Libro l = libroRepository.findById(Objects.requireNonNull(libroId)).orElseThrow(() -> new RuntimeException("Libro no encontrado"));
        Prestamo p = new Prestamo();
        p.setUsuario(u);
        p.setLibro(l);
        p.setTipoPrestamo("VIRTUAL");
        p.setDevuelto(true);
        p.setEstado("DEVUELTO");
        p.setFechaPrestamo(LocalDateTime.now());
        p.setFechaDevolucion(LocalDateTime.now());
        p.setFechaDevolucionReal(LocalDateTime.now());
        prestamoRepository.save(p);
    }

    @Override
    public List<String> getDebugLogs() {
        return new java.util.ArrayList<>(debugLogs);
    }
}
