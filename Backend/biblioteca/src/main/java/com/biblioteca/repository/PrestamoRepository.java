package com.biblioteca.repository;

import com.biblioteca.entity.Prestamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    // Buscar préstamos NO devueltos cuya fecha de devolución ya pasó
    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBefore(java.time.LocalDateTime fecha);

    // Buscar préstamos por ID de usuario
    List<Prestamo> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.Query("SELECT p.libro.titulo, COUNT(p) as total FROM Prestamo p GROUP BY p.libro.titulo ORDER BY total DESC")
    List<Object[]> findMostBorrowedBooks();

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('MONTHNAME', p.fechaPrestamo), COUNT(p) FROM Prestamo p GROUP BY FUNCTION('MONTHNAME', p.fechaPrestamo)")
    List<Object[]> findLoansByMonth();

    @org.springframework.data.jpa.repository.Query("SELECT p.libro.genero.nombre, COUNT(p) as total FROM Prestamo p GROUP BY p.libro.genero.nombre ORDER BY total DESC")
    List<Object[]> findLoansByGenre();

    @org.springframework.data.jpa.repository.Query("SELECT p.usuario.rol.nombre, COUNT(p) as total FROM Prestamo p GROUP BY p.usuario.rol.nombre ORDER BY total DESC")
    List<Object[]> findLoansByUserRole();

    @org.springframework.data.jpa.repository.Query("SELECT a.nombre, COUNT(p) as total FROM Prestamo p JOIN p.libro.autores a GROUP BY a.nombre ORDER BY total DESC")
    List<Object[]> findMostBorrowedAuthors();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Prestamo p WHERE p.devuelto = true AND p.fechaDevolucionReal <= p.fechaDevolucion")
    long countOnTimeReturns();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Prestamo p WHERE p.devuelto = true")
    long countTotalReturns();

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBetween(java.time.LocalDateTime start,
            java.time.LocalDateTime end);

    long countByDevueltoFalse();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) > 0 FROM Prestamo p WHERE p.usuario.id = :usuarioId AND p.libro.id = :libroId AND p.tipoPrestamo = 'VIRTUAL' AND DATE(p.fechaPrestamo) = CURRENT_DATE")
    boolean existsVirtualReadToday(@org.springframework.data.repository.query.Param("usuarioId") Long usuarioId, @org.springframework.data.repository.query.Param("libroId") Long libroId);
}
