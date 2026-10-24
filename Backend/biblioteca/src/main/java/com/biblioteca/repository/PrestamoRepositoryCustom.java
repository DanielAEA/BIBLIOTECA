package com.biblioteca.repository;
import org.bson.Document;
import java.util.List;

public interface PrestamoRepositoryCustom {
    List<Document> findMostBorrowedBooks();
    List<Document> findLoansByGenre();
    List<Document> findLoansByUserRole();
    List<Document> findLoansByMonth();
    List<Document> findMostBorrowedAuthors();
    List<Document> findFinesStats();
    List<Document> findLoansByStatus();
    com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> findPrestamosPaginados(
            org.springframework.data.domain.Pageable pageable,
            String usuario, String libro, String ejemplarCodigo, String estado, Boolean soloConMulta);
    com.biblioteca.dto.PageResponse<java.util.Map<String, Object>> findPrestamosPorUsuarioPaginados(
            String usuarioId, org.springframework.data.domain.Pageable pageable);
}
