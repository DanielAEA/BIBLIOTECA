package com.biblioteca.service;

import com.biblioteca.entity.*;
import com.biblioteca.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.bson.Document;

@Service
public class StatsService {

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;

    public StatsService(PrestamoRepository prestamoRepository, LibroRepository libroRepository,
            UsuarioRepository usuarioRepository) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLibros", libroRepository.count());
        summary.put("totalUsuarios", usuarioRepository.count());
        summary.put("prestamosActivos", prestamoRepository.countByDevueltoFalse());

        double totalMultas = 0.0;
        
        // Calcular multas de préstamos devueltos con multa y préstamos vencidos aún no devueltos
        List<Prestamo> todos = prestamoRepository.findAll();
        for (Prestamo p : todos) {
            // Multa consolidada en el objeto
            if (p.getMulta() != null && !Boolean.TRUE.equals(p.getMulta().getPagada())) {
                totalMultas += p.getMulta().getTotal();
            }
            // Multa potencial si no ha devuelto y ya venció
            if (!Boolean.TRUE.equals(p.getDevuelto()) && p.getFechaDevolucion().isBefore(LocalDateTime.now())) {
                long dias = ChronoUnit.DAYS.between(p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), 
                                                 LocalDateTime.now().truncatedTo(ChronoUnit.DAYS));
                if (dias > 0) {
                    totalMultas += 2000.0 * dias;
                }
            }
        }
        summary.put("totalMultasPendientes", totalMultas);

        // Obtener cantidad de préstamos vencidos
        summary.put("prestamosVencidos", prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now()).size());

        // Contar ejemplares disponibles (están embebidos en libros)
        long disponibles = libroRepository.findAll().stream()
                .filter(l -> l.getEjemplares() != null)
                .flatMap(l -> l.getEjemplares().stream())
                .filter(e -> Boolean.TRUE.equals(e.getDisponible()))
                .count();
        summary.put("ejemplaresDisponibles", disponibles);

        // Calcular nuevos usuarios del último mes
        LocalDateTime mesAtras = LocalDateTime.now().minusMonths(1);
        summary.put("nuevosUsuariosMes", usuarioRepository.countByFechaRegistroBetween(mesAtras, LocalDateTime.now()));

        return summary;
    }

    public List<Map<String, Object>> getMostBorrowedBooks() {
        return mapMongoResults(prestamoRepository.findMostBorrowedBooks(), "titulo", "total");
    }

    public Map<String, Long> getInventoryDistribution() {
        Map<String, Long> dist = new HashMap<>();
        dist.put("FISICO", libroRepository.countByFormato("FISICO"));
        dist.put("DIGITAL", libroRepository.countByFormato("DIGITAL"));
        dist.put("AMBOS", libroRepository.countByFormato("AMBOS"));
        return dist;
    }

    public List<Map<String, Object>> getLoansByGenre() {
        return mapMongoResults(prestamoRepository.findLoansByGenre(), "genero", "total");
    }

    public List<Map<String, Object>> getLoansByUserRole() {
        return mapMongoResults(prestamoRepository.findLoansByUserRole(), "rol", "total");
    }

    public List<Map<String, Object>> getLoansByMonth() {
        return mapMongoResults(prestamoRepository.findLoansByMonth(), "mes", "total");
    }

    public List<Map<String, Object>> getMostBorrowedAuthors() {
        return mapMongoResults(prestamoRepository.findMostBorrowedAuthors(), "autor", "total");
    }

    public List<Map<String, Object>> getLoansByStatus() {
        return mapMongoResults(prestamoRepository.findLoansByStatus(), "estado", "total");
    }

    public Map<String, Object> getPunctualityRate() {
        long total = prestamoRepository.count();
        if (total == 0) return Map.of("aTiempo", 0, "atrasados", 0);
        
        long atrasados = prestamoRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getDevuelto()) && p.getFechaDevolucionReal() != null && p.getFechaDevolucionReal().isAfter(p.getFechaDevolucion()))
                .count();
        
        Map<String, Object> rate = new HashMap<>();
        rate.put("aTiempo", total - atrasados);
        rate.put("atrasados", atrasados);
        return rate;
    }

    public List<Map<String, Object>> getUsersWithDebt() {
        return prestamoRepository.findAll().stream()
                .filter(p -> p.getMulta() != null && !Boolean.TRUE.equals(p.getMulta().getPagada()))
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("usuario", p.getUsuario().getNombre());
                    map.put("monto", p.getMulta().getTotal());
                    map.put("libro", p.getLibro() != null ? p.getLibro().getTitulo() : "N/A");
                    return map;
                }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getFinesStats() {
        return prestamoRepository.findFinesStats().stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("estado", doc.get("_id").equals(true) ? "PAGADA" : "PENDIENTE");
            map.put("total", doc.get("total"));
            map.put("cantidad", doc.get("cantidad"));
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUpcomingExpirations() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in3Days = now.plusDays(3);
        return prestamoRepository.findByDevueltoFalseAndFechaDevolucionBetween(now, in3Days).stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("usuario", p.getUsuario().getNombre());
            map.put("libro", p.getLibro() != null ? p.getLibro().getTitulo() : "N/A");
            map.put("vencimiento", p.getFechaDevolucion());
            return map;
        }).collect(Collectors.toList());
    }

    public List<Libro> getInactiveBooks() {
        return libroRepository.findAll().stream()
                .filter(l -> l.getEjemplares() == null || l.getEjemplares().isEmpty())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapMongoResults(List<Document> results, String keyName, String valueName) {
        return results.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put(keyName, doc.get("_id"));
            map.put(valueName, doc.get("total"));
            return map;
        }).collect(Collectors.toList());
    }
}