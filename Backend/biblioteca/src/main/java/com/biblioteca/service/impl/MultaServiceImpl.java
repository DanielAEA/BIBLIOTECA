package com.biblioteca.service.impl;

import com.biblioteca.entity.Multa;
import com.biblioteca.repository.MultaRepository;
import com.biblioteca.service.MultaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class MultaServiceImpl implements MultaService {

    private final MultaRepository multaRepository;

    public MultaServiceImpl(MultaRepository multaRepository) {
        this.multaRepository = multaRepository;
    }

    @Override
    @NonNull
    public Multa crear(@NonNull Multa multa) {
        multa.setId(null);
        return Objects.requireNonNull(multaRepository.save(multa));
    }

    @Override
    public Multa obtenerPorId(@NonNull String id) {
        return multaRepository.findById(Objects.requireNonNull(id)).orElse(null);
    }

    @Override
    @NonNull
    public List<Multa> listar() {
        return multaRepository.findAll();
    }

    @Override
    @NonNull
    @SuppressWarnings("null") 
    public Multa actualizar(@NonNull String id, @NonNull Multa multa) {
        Multa existente = multaRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Multa no encontrada"));
        
        
        if (multa.getTotal() != null) existente.setTotal(multa.getTotal());
        if (multa.getDiasAtraso() != null) existente.setDiasAtraso(multa.getDiasAtraso());
        if (multa.getPagada() != null) existente.setPagada(multa.getPagada());

        return Objects.requireNonNull(multaRepository.save(existente));
    }

    @Override
    public void eliminar(@NonNull String id) {
        multaRepository.deleteById(Objects.requireNonNull(id));
    }
}
