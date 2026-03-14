package com.biblioteca.service.impl;

import com.biblioteca.entity.Sala;
import com.biblioteca.repository.SalaRepository;
import com.biblioteca.service.SalaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalaServiceImpl implements SalaService {

    private final SalaRepository salaRepository;

    public SalaServiceImpl(SalaRepository salaRepository) {
        this.salaRepository = salaRepository;
    }

    @Override
    public Sala crear(Sala sala) {
        return salaRepository.save(sala);
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
    public Sala obtenerPorId(Long id) {
        return salaRepository.findById(id).orElse(null);
    }

    @Override
    public Sala actualizar(Long id, Sala sala) {
        salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));
        sala.setId(id);
        return salaRepository.save(sala);
    }

    @Override
    public void eliminar(Long id) {
        salaRepository.deleteById(id);
    }
}
