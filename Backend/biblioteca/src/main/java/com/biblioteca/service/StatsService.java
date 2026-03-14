package com.biblioteca.service;

import com.biblioteca.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLibros", libroRepository.count());
        summary.put("totalUsuarios", usuarioRepository.count());
        summary.put("prestamosActivos", prestamoRepository.countByDevueltoFalse());

        Double multasPendientes = multaRepository.sumPendingFines();
        summary.put("totalMultasPendientes", multasPendientes != null ? multasPendientes : 0.0);

        summary.put("prestamosVencidos", prestamoRepository.findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime.now()).size());

        summary.put("ejemplaresDisponibles", ejemplarRepository.findAll().stream().filter(e -> Boolean.TRUE.equals(e.getDisponible())).count());

        LocalDateTime mesAtras = LocalDateTime.now().minusMonths(1);
        summary.put("nuevosUsuariosMes", usuarioRepository.countByFechaRegistroBetween(mesAtras, LocalDateTime.now()));

        return summary;
    }

    public List<Map<String, Object>> getMostBorrowedBooks() {
        List<Object[]> results = prestamoRepository.findMostBorrowedBooks();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("titulo", row[0]);
            map.put("total", row[1]);
            return map;
        }).limit(5).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLoansByMonth() {
        List<Object[]> results = prestamoRepository.findLoansByMonth();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("mes", row[0]);
            map.put("total", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Long> getInventoryDistribution() {
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
        long onTime = prestamoRepository.countOnTimeReturns();
        long total = prestamoRepository.countTotalReturns();
        Map<String, Object> res = new HashMap<>();
        res.put("onTime", onTime);
        res.put("total", total);
        res.put("rate", total > 0 ? (double) onTime / total * 100 : 100.0);
        return res;
    }

    public List<Map<String, Object>> getUsersWithDebt() {
        return mapResults(multaRepository.findUsersWithDebt(), "usuario", "deuda");
    }

    public List<Map<String, Object>> getFinesStats() {
        List<Object[]> results = multaRepository.findFinesStats();
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("estado", Boolean.TRUE.equals(row[0]) ? "Pagada" : "Pendiente");
            map.put("total", row[1]);
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUpcomingExpirations() {
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
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        return libroRepository.findInactiveBooks(sixMonthsAgo).stream().limit(5).map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("titulo", l.getTitulo());
            map.put("id", l.getId());
            return map;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapResults(List<Object[]> results, String keyName, String valueName) {
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put(keyName, row[0]);
            map.put(valueName, row[1]);
            return map;
        }).collect(Collectors.toList());
    }
}
