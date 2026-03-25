package com.biblioteca.service;

import com.biblioteca.entity.*;
import com.biblioteca.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatsService {

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;
    private final MultaRepository multaRepository;
    private final EjemplarRepository ejemplarRepository;

    public StatsService(PrestamoRepository prestamoRepository, LibroRepository libroRepository,
            UsuarioRepository usuarioRepository, EjemplarRepository ejemplarRepository,
            MultaRepository multaRepository) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
        this.multaRepository = multaRepository;
        this.ejemplarRepository = ejemplarRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migratePrestamos() {
        // Asignar el libro a todos los préstamos históricos que solo tienen ejemplar
        List<Prestamo> prestamos = prestamoRepository.findAll();
        for (Prestamo p : prestamos) {
             if (p.getLibro() == null && p.getEjemplar() != null && p.getEjemplar().getLibro() != null) {
                  p.setLibro(p.getEjemplar().getLibro());
                  prestamoRepository.save(p);
             }
        }
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLibros", libroRepository.count());
        summary.put("totalUsuarios", usuarioRepository.count());
        summary.put("prestamosActivos", prestamoRepository.countByDevueltoFalse());

        Double multasPagadasPersistent = multaRepository.sumPendingFines();
        double totalMultas = multasPagadasPersistent != null ? multasPagadasPersistent : 0.0;
        
        // Sumar multas potenciales de préstamos vencidos aún no devueltos
        List<Prestamo> vencidos = prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now());
        if (!vencidos.isEmpty()) {
            for (Prestamo p : vencidos) {
                long dias = ChronoUnit.DAYS.between(
                        p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), 
                        LocalDateTime.now().truncatedTo(ChronoUnit.DAYS)
                );
                if (dias > 0) {
                    totalMultas += 2000.0 * dias;
                }
            }
        }
        summary.put("totalMultasPendientes", totalMultas);

        // Obtener cantidad de préstamos vencidos
        summary.put("prestamosVencidos", prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now()).size());

        // Contar ejemplares disponibles
        summary.put("ejemplaresDisponibles", ejemplarRepository.findAll().stream().filter(e -> Boolean.TRUE.equals(e.getDisponible())).count());

        // Calcular nuevos usuarios del último mes
        LocalDateTime mesAtras = LocalDateTime.now().minusMonths(1);
        summary.put("nuevosUsuariosMes", usuarioRepository.countByFechaRegistroBetween(mesAtras, LocalDateTime.now()));

        // Tasa de puntualidad para el resumen
        long aTiempo = prestamoRepository.countOnTimeReturns();
        long total = prestamoRepository.countTotalReturns();
        summary.put("tasaPuntualidad", total > 0 ? (double) aTiempo / total * 100 : 100.0);

        return summary;
    }

    public List<Map<String, Object>> getMostBorrowedBooks() {
        return mapResults(prestamoRepository.findMostBorrowedBooks(), "titulo", "total").stream().limit(5).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLoansByMonth() {
        return mapResults(prestamoRepository.findLoansByMonth(), "mes", "total");
    }

    public Map<String, Long> getInventoryDistribution() {
        // Distribución del inventario por formato
        Map<String, Long> dist = new HashMap<>();
        dist.put("FISICO", libroRepository.countByFormato("FISICO"));
        dist.put("DIGITAL", libroRepository.countByFormato("DIGITAL"));
        dist.put("AMBOS", libroRepository.countByFormato("AMBOS"));
        return dist;
    }

    public List<Map<String, Object>> getLoansByGenre() {
        return mapResults(prestamoRepository.findLoansByGenre(), "genero", "total");
    }

    public List<Map<String, Object>> getLoansByUserRole() {
        return mapResults(prestamoRepository.findLoansByUserRole(), "rol", "total");
    }

    public List<Map<String, Object>> getMostBorrowedAuthors() {
        return mapResults(prestamoRepository.findMostBorrowedAuthors(), "autor", "total").stream().limit(5).collect(Collectors.toList());
    }

    public Map<String, Object> getPunctualityRate() {
        // Calcular tasa de puntualidad en devoluciones
        long onTime = prestamoRepository.countOnTimeReturns();
        long total = prestamoRepository.countTotalReturns();
        Map<String, Object> res = new HashMap<>();
        res.put("aTiempo", onTime);
        res.put("total", total);
        res.put("tasa", total > 0 ? (double) onTime / total * 100 : 100.0);
        return res;
    }

    public List<Map<String, Object>> getUsersWithDebt() {
        Map<Long, Double> userDebtMap = new HashMap<>();
        Map<Long, String> userNameMap = new HashMap<>();

        // 1. Deudas consolidadas en la tabla Multas
        List<Object[]> persistentStats = multaRepository.findUsersWithDebt();
        for (Object[] row : persistentStats) {
            Long id = ((Number) row[0]).longValue();
            String name = (String) row[1];
            Double debt = ((Number) row[2]).doubleValue();
            userDebtMap.put(id, debt);
            userNameMap.put(id, name);
        }

        // 2. Deudas potenciales de préstamos vencidos no devueltos
        List<Prestamo> vencidos = prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now());
        if (!vencidos.isEmpty()) {
            for (Prestamo p : vencidos) {
                Long id = p.getUsuario().getId();
                String nombre = p.getUsuario().getNombre();
                long dias = ChronoUnit.DAYS.between(
                        p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), 
                        LocalDateTime.now().truncatedTo(ChronoUnit.DAYS)
                );
                if (dias > 0) {
                    double deudaExtra = 2000.0 * dias;
                    userDebtMap.put(id, userDebtMap.getOrDefault(id, 0.0) + deudaExtra);
                    userNameMap.put(id, nombre);
                }
            }
        }

        // Convertir mapa a lista de resultados ordenada por deuda
        return userDebtMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("usuarioId", e.getKey());
                    map.put("usuario", userNameMap.get(e.getKey()));
                    map.put("deuda", e.getValue());
                    return map;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("deuda"), (Double) a.get("deuda")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getFinesStats() {
        double pagada = 0.0;
        double pendiente = 0.0;

        // 1. Multas consolidadas en base de datos
        List<Object[]> results = multaRepository.findFinesStats();
        for (Object[] row : results) {
            double v = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            if (Boolean.TRUE.equals(row[0])) pagada += v;
            else pendiente += v;
        }

        // 2. Multas potenciales de préstamos vencidos no devueltos
        List<Prestamo> vencidos = prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now());
        if (!vencidos.isEmpty()) {
            for (Prestamo p : vencidos) {
                long dias = ChronoUnit.DAYS.between(
                        p.getFechaDevolucion().truncatedTo(ChronoUnit.DAYS), 
                        LocalDateTime.now().truncatedTo(ChronoUnit.DAYS)
                );
                if (dias > 0) {
                    pendiente += 2000.0 * dias;
                }
            }
        }

        List<Map<String, Object>> stats = new ArrayList<>();
        if (pagada == 0 && pendiente == 0) {
            return stats; // Empty list so chart handles gracefully
        }

        Map<String, Object> mapPagada = new HashMap<>();
        mapPagada.put("estado", "Pagada");
        mapPagada.put("total", pagada);
        stats.add(mapPagada);

        Map<String, Object> mapPendiente = new HashMap<>();
        mapPendiente.put("estado", "Pendiente");
        mapPendiente.put("total", pendiente);
        stats.add(mapPendiente);

        return stats;
    }

    public List<Map<String, Object>> getUpcomingExpirations() {
        // Préstamos próximos a vencer (en los siguientes 3 días)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in3Days = now.plusDays(3);
        return prestamoRepository.findByDevueltoFalseAndFechaDevolucionBetween(now, in3Days).stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("usuario", p.getUsuario().getNombre());
            map.put("libro", p.getEjemplar().getLibro().getTitulo());
            map.put("vencimiento", p.getFechaDevolucion());
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getInactiveBooks() {
        // Libros sin movimiento en los últimos 6 meses
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        return libroRepository.findInactiveBooks(sixMonthsAgo).stream().limit(5).map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("titulo", l.getTitulo());
            map.put("id", l.getId());
            return map;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapResults(List<Object[]> results, String keyName, String valueName) {
        // Utilidad para mapear resultados genéricos de consultas nativas
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put(keyName, row[0]);
            map.put(valueName, row[1]);
            return map;
        }).collect(Collectors.toList());
    }
}
