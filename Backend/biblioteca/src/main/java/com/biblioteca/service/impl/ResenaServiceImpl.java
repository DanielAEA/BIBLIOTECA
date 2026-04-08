package com.biblioteca.service.impl;

import com.biblioteca.entity.Resena;
import com.biblioteca.repository.ResenaRepository;
import com.biblioteca.service.ResenaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class ResenaServiceImpl implements ResenaService {

    private final ResenaRepository resenaRepository;

    public ResenaServiceImpl(ResenaRepository resenaRepository) {
        this.resenaRepository = resenaRepository;
    }

    @Override
    public Resena crear(@NonNull Resena resena) {
        resena.setId(null);
        return resenaRepository.save(resena);
    }

    @Override
    public Resena obtenerPorId(@NonNull String id) {
        return resenaRepository.findById(id).orElse(null);
    }

    @Override
    public List<Resena> listar() {
        return resenaRepository.findAll();
    }

    @Override
    public List<Resena> listarPorLibro(@NonNull String libroId) {
        return resenaRepository.findByLibroId(libroId);
    }

    @Override
    public List<Resena> listarPorUsuario(@NonNull String usuarioId) {
        return resenaRepository.findAll().stream()
                .filter(r -> r.getUsuario() != null && usuarioId.equals(r.getUsuario().getId()))
                .toList();
    }

    @Override
    public Resena actualizar(@NonNull String id, @NonNull Resena resena) {
        Resena existente = resenaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada"));
        existente.setCalificacion(resena.getCalificacion());
        existente.setComentario(resena.getComentario());
        return resenaRepository.save(existente);
    }

    @Override
    public Double obtenerPromedioCalificacion(@NonNull String libroId) {
        List<Resena> resenas = listarPorLibro(libroId);
        if (resenas.isEmpty()) return 0.0;
        return resenas.stream()
                .mapToInt(Resena::getCalificacion)
                .average()
                .orElse(0.0);
    }

    @Override
    public void eliminar(@NonNull String id) {
        resenaRepository.deleteById(id);
    }
}