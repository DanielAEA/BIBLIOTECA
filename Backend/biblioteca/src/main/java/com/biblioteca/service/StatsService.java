package com.biblioteca.service;

import com.biblioteca.entity.*;
import com.biblioteca.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private PrestamoRepository prestamoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MultaRepository multaRepository;

    @Autowired
    private EjemplarRepository ejemplarRepository;

    @Autowired
    private PrecioMultaRepository precioMultaRepository;

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
            PrecioMulta precio = precioMultaRepository.findTopByOrderByVigenteDesdeDesc();
            if (precio != null) {
                for (Prestamo p : vencidos) {
                    long dias = ChronoUnit.DAYS.between(p.getFechaDevolucion(), LocalDateTime.now());
                    if (dias > 0) {
                        totalMultas += precio.getValorPorDia() * dias;
                    }
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
        // Obtener los libros más prestados del repositorio
        List<Object[]> results = prestamoRepository.findMostBorrowedBooks();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("titulo", row[0]);
            map.put("total", row[1]);
            return map;
        }).limit(5).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLoansByMonth() {
        // Agrupar préstamos por mes
        List<Object[]> results = prestamoRepository.findLoansByMonth();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("mes", row[0]);
            map.put("total", row[1]);
            return map;
        }).collect(Collectors.toList());
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
        return mapResults(prestamoRepository.findMostBorrowedAuthors(), "autor", "total");
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
        Map<String, Double> userDebtMap = new HashMap<>();

        // 1. Deudas consolidadas en la tabla Multas
        List<Object[]> persistentStats = multaRepository.findUsersWithDebt();
        for (Object[] row : persistentStats) {
            userDebtMap.put((String) row[0], (Double) row[1]);
        }

        // 2. Deudas potenciales de préstamos vencidos no devueltos
        List<Prestamo> vencidos = prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now());
        if (!vencidos.isEmpty()) {
            PrecioMulta precio = precioMultaRepository.findTopByOrderByVigenteDesdeDesc();
            if (precio != null) {
                for (Prestamo p : vencidos) {
                    String nombre = p.getUsuario().getNombre();
                    long dias = ChronoUnit.DAYS.between(p.getFechaDevolucion(), LocalDateTime.now());
                    if (dias > 0) {
                        double deudaExtra = precio.getValorPorDia() * dias;
                        userDebtMap.put(nombre, userDebtMap.getOrDefault(nombre, 0.0) + deudaExtra);
                    }
                }
            }
        }

        // Convertir mapa a lista de resultados ordenada por deuda
        return userDebtMap.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("usuario", e.getKey());
                    map.put("deuda", e.getValue());
                    return map;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("deuda"), (Double) a.get("deuda")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getFinesStats() {
        // Estadísticas de multas por estado
        List<Object[]> results = multaRepository.findFinesStats();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("estado", Boolean.TRUE.equals(row[0]) ? "Pagada" : "Pendiente");
            map.put("total", row[1]);
            return map;
        }).collect(Collectors.toList());
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
