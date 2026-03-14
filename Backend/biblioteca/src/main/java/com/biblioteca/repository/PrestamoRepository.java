package com.biblioteca.repository;

import com.biblioteca.entity.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    // Buscar préstamos NO devueltos cuya fecha de devolución ya pasó
    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBefore(java.time.LocalDateTime fecha);

    // Buscar préstamos por ID de usuario
    List<Prestamo> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.Query("SELECT p.ejemplar.libro.titulo, COUNT(p) as total FROM Prestamo p GROUP BY p.ejemplar.libro.titulo ORDER BY total DESC")
    List<Object[]> findMostBorrowedBooks();

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('MONTHNAME', p.fechaPrestamo), COUNT(p) FROM Prestamo p GROUP BY FUNCTION('MONTHNAME', p.fechaPrestamo)")
    List<Object[]> findLoansByMonth();

    @org.springframework.data.jpa.repository.Query("SELECT p.ejemplar.libro.genero.nombre, COUNT(p) as total FROM Prestamo p GROUP BY p.ejemplar.libro.genero.nombre ORDER BY total DESC")
    List<Object[]> findLoansByGenre();

    @org.springframework.data.jpa.repository.Query("SELECT p.usuario.rol.nombre, COUNT(p) as total FROM Prestamo p GROUP BY p.usuario.rol.nombre ORDER BY total DESC")
    List<Object[]> findLoansByUserRole();

    @org.springframework.data.jpa.repository.Query("SELECT p.ejemplar.libro.autores[0].nombre, COUNT(p) as total FROM Prestamo p GROUP BY p.ejemplar.libro.autores[0].nombre ORDER BY total DESC")
    List<Object[]> findMostBorrowedAuthors();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Prestamo p WHERE p.devuelto = true AND p.fechaDevolucionReal <= p.fechaDevolucion")
    long countOnTimeReturns();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Prestamo p WHERE p.devuelto = true")
    long countTotalReturns();

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    long countByDevueltoFalse();
}
