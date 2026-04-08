package com.biblioteca.service.impl;

import com.biblioteca.entity.Sala;
import com.biblioteca.repository.SalaRepository;
import com.biblioteca.service.SalaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class SalaServiceImpl implements SalaService {

    private final SalaRepository salaRepository;

    public SalaServiceImpl(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    @Override
    public Sala crear(@NonNull Sala sala) {
        sala.setId(null);
        return salaRepository.save(sala);
    }

    @Override
    public Sala obtenerPorId(@NonNull String id) {
        return salaRepository.findById(id).orElse(null);
    }

    @Override
    public List<Sala> listar() {
        return salaRepository.findAll();
    }

    @Override
    public List<Sala> listarActivas() {
        return salaRepository.findByActivaTrue();
    }

    @Override
    public Sala actualizar(@NonNull String id, @NonNull Sala sala) {
        Sala existente = salaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));
        existente.setNombre(sala.getNombre());
        existente.setDescription(sala.getDescription());
        existente.setCapacidad(sala.getCapacidad());
        existente.setUbicacion(sala.getUbicacion());
        existente.setActiva(sala.getActiva());
        return salaRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull String id) {
        salaRepository.deleteById(id);
    }
}