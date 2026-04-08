package com.biblioteca.controller;

import com.biblioteca.service.StatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    @org.springframework.beans.factory.annotation.Value("${spring.data.mongodb.uri:NOT_FOUND}")
    private String mongoUri;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of("mongoUri", mongoUri);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return statsService.getSummary();
    }

    @GetMapping("/most-borrowed")
    public List<Map<String, Object>> getMostBorrowedBooks() {
        return statsService.getMostBorrowedBooks();
    }

    @GetMapping("/loans-by-month")
    public List<Map<String, Object>> getLoansByMonth() {
        return statsService.getLoansByMonth();
    }

    @GetMapping("/inventory")
    public Map<String, Long> getInventoryDistribution() {
        return statsService.getInventoryDistribution();
    }

    @GetMapping("/by-genre")
    public List<Map<String, Object>> getLoansByGenre() {
        return statsService.getLoansByGenre();
    }

    @GetMapping("/by-role")
    public List<Map<String, Object>> getLoansByUserRole() {
        return statsService.getLoansByUserRole();
    }

    @GetMapping("/by-status")
    public List<Map<String, Object>> getLoansByStatus() {
        return statsService.getLoansByStatus();
    }

    @GetMapping("/most-borrowed-authors")
    public List<Map<String, Object>> getMostBorrowedAuthors() {
        return statsService.getMostBorrowedAuthors();
    }

    @GetMapping("/punctuality")
    public Map<String, Object> getPunctualityRate() {
        return statsService.getPunctualityRate();
    }

    @GetMapping("/debtors")
    public List<Map<String, Object>> getUsersWithDebt() {
        return statsService.getUsersWithDebt();
    }

    @GetMapping("/fines-stats")
    public List<Map<String, Object>> getFinesStats() {
        return statsService.getFinesStats();
    }

    @GetMapping("/upcoming-expirations")
    public List<Map<String, Object>> getUpcomingExpirations() {
        return statsService.getUpcomingExpirations();
    }

    @GetMapping("/inactive-books")
    public List<com.biblioteca.entity.Libro> getInactiveBooks() {
        return statsService.getInactiveBooks();
    }
}
