package com.biblioteca.service;

import com.biblioteca.dto.LibroDTO;
import com.biblioteca.dto.PageResponse;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.service.impl.LibroServiceImpl;
import com.biblioteca.service.impl.PrestamoServiceImpl;
import com.biblioteca.service.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaginationServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private LibroRepository libroRepository;

    @Mock
    private CoverService coverService;

    private UsuarioServiceImpl usuarioService;
    private PrestamoServiceImpl prestamoService;
    private LibroServiceImpl libroService;

    @BeforeEach
    void setUp() {
        usuarioService = new UsuarioServiceImpl(usuarioRepository, passwordEncoder);
        prestamoService = new PrestamoServiceImpl(prestamoRepository, usuarioRepository, libroRepository);
        libroService = new LibroServiceImpl(libroRepository, coverService);
    }

    @Test
    void testUsuarioListarPaginadoSinBusqueda() {
        Pageable pageable = PageRequest.of(0, 10);
        Usuario u = new Usuario();
        u.setId("1");
        u.setNombre("Test");
        Page<Usuario> mockPage = new PageImpl<>(List.of(u), pageable, 1);

        when(usuarioRepository.findAll(pageable)).thenReturn(mockPage);

        Page<Usuario> result = usuarioService.listarPaginado(pageable, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(usuarioRepository, times(1)).findAll(pageable);
        verify(usuarioRepository, never()).findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase(anyString(), anyString(), any());
    }

    @Test
    void testUsuarioListarPaginadoConBusqueda() {
        Pageable pageable = PageRequest.of(0, 10);
        Usuario u = new Usuario();
        u.setId("1");
        u.setNombre("Carlos");
        Page<Usuario> mockPage = new PageImpl<>(List.of(u), pageable, 1);

        when(usuarioRepository.findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase("Carlos", "Carlos", pageable))
                .thenReturn(mockPage);

        Page<Usuario> result = usuarioService.listarPaginado(pageable, "Carlos");

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(usuarioRepository, times(1))
                .findByNombreContainingIgnoreCaseOrCorreoContainingIgnoreCase("Carlos", "Carlos", pageable);
    }

    @Test
    void testPrestamoListarPaginado() {
        Pageable pageable = PageRequest.of(0, 10);
        PageResponse<Map<String, Object>> mockResponse = PageResponse.of(Collections.emptyList(), 0, 10, 0);

        when(prestamoRepository.findPrestamosPaginados(pageable, "user", "book", "LIB001", "ACTIVO", true))
                .thenReturn(mockResponse);

        PageResponse<Map<String, Object>> result = prestamoService.listarPaginado(pageable, "user", "book", "LIB001", "ACTIVO", true);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getPage());
        verify(prestamoRepository, times(1))
                .findPrestamosPaginados(pageable, "user", "book", "LIB001", "ACTIVO", true);
    }

    @Test
    void testPrestamoListarPorUsuarioPaginado() {
        Pageable pageable = PageRequest.of(0, 10);
        PageResponse<Map<String, Object>> mockResponse = PageResponse.of(Collections.emptyList(), 0, 10, 0);

        when(prestamoRepository.findPrestamosPorUsuarioPaginados("user123", pageable))
                .thenReturn(mockResponse);

        PageResponse<Map<String, Object>> result = prestamoService.listarPorUsuarioPaginado("user123", pageable);

        assertNotNull(result);
        verify(prestamoRepository, times(1)).findPrestamosPorUsuarioPaginados("user123", pageable);
    }

    @Test
    void testLibroListarPaginado() {
        Pageable pageable = PageRequest.of(0, 10);
        PageResponse<LibroDTO> mockResponse = PageResponse.of(Collections.emptyList(), 0, 10, 0);

        when(libroRepository.findLibrosPaginados(pageable, "quijote", null, null, null, null))
                .thenReturn(mockResponse);

        PageResponse<LibroDTO> result = libroService.listarPaginado(pageable, "quijote", null, null, null, null);

        assertNotNull(result);
        verify(libroRepository, times(1)).findLibrosPaginados(pageable, "quijote", null, null, null, null);
    }

    @Test
    void testPageResponseCalculations() {
        PageResponse<String> page = PageResponse.of(List.of("a", "b"), 0, 2, 5);

        assertEquals(0, page.getPage());
        assertEquals(2, page.getSize());
        assertEquals(5, page.getTotalElements());
        assertEquals(3, page.getTotalPages());
        assertTrue(page.isFirst());
        assertFalse(page.isLast());

        PageResponse<String> lastPage = PageResponse.of(List.of("e"), 2, 2, 5);
        assertFalse(lastPage.isFirst());
        assertTrue(lastPage.isLast());
    }
}
