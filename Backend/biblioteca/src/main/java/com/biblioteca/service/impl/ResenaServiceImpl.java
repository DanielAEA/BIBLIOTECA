package com.biblioteca.service.impl;

import com.biblioteca.entity.Resena;
import com.biblioteca.repository.ResenaRepository;
import com.biblioteca.service.ResenaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResenaServiceImpl implements ResenaService {

    private final ResenaRepository resenaRepository;

    public ResenaServiceImpl(ResenaRepository resenaRepository) {
        this.resenaRepository = resenaRepository;
    }

    @Override
    public Resena crear(Resena resena) {
        resena.setId(null);
        if (resenaRepository.existsByLibroIdAndUsuarioId(
                resena.getLibro().getId(), resena.getUsuario().getId())) {
            throw new RuntimeException("Ya has dejado una reseña para este libro");
        }
        if (resena.getCalificacion() < 1 || resena.getCalificacion() > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }
        return resenaRepository.save(resena);
    }

    @Override
    public List<Resena> listar() {
        return resenaRepository.findAll();
    }

    @Override
    public List<Resena> listarPorLibro(Long libroId) {
        return resenaRepository.findByLibroId(libroId);
    }

    @Override
    public List<Resena> listarPorUsuario(Long usuarioId) {
        return resenaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Double obtenerPromedioCalificacion(Long libroId) {
        return resenaRepository.findPromedioCalificacionByLibroId(libroId);
    }

    @Override
    public Resena obtenerPorId(Long id) {
        return resenaRepository.findById(id).orElse(null);
    }

    @Override
    public Resena actualizar(Long id, Resena resena) {
        resenaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));
        resena.setId(id);
        return resenaRepository.save(resena);
    }

    @Override
    public void eliminar(Long id) {
        resenaRepository.deleteById(id);
    }

    @Override
    public boolean yaReseño(Long libroId, Long usuarioId) {
        return resenaRepository.existsByLibroIdAndUsuarioId(libroId, usuarioId);
    }
}
