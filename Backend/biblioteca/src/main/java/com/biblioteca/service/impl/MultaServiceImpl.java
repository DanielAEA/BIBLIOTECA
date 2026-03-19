package com.biblioteca.service.impl;

import com.biblioteca.entity.Multa;
import com.biblioteca.repository.MultaRepository;
import com.biblioteca.service.MultaService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MultaServiceImpl implements MultaService {

    private final MultaRepository multaRepository;

    public MultaServiceImpl(MultaRepository multaRepository) {
        this.multaRepository = multaRepository;
    }

    @Override
    public Multa crear(@NonNull Multa multa) {
        multa.setId(null);
        return multaRepository.save(multa);
    }

    @Override
    public Multa obtenerPorId(@NonNull Long id) {
        return multaRepository.findById(id).orElse(null);
    }

    @Override
    public List<Multa> listar() { return multaRepository.findAll(); }

    @Override
    public Multa actualizar(@NonNull Long id, @NonNull Multa multa) {
        Multa existente = multaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Multa no encontrada"));
        
        // Solo actualizamos los campos que pueden cambiar
        if (multa.getTotal() != null) existente.setTotal(multa.getTotal());
        if (multa.getDiasAtraso() != null) existente.setDiasAtraso(multa.getDiasAtraso());
        if (multa.getPagada() != null) existente.setPagada(multa.getPagada());
        
        // Mantener las relaciones originales si no vienen en el objeto
        if (multa.getPrestamo() != null) existente.setPrestamo(multa.getPrestamo());
        if (multa.getPrecioMulta() != null) existente.setPrecioMulta(multa.getPrecioMulta());

        return multaRepository.save(existente);
    }

    @Override
    public void eliminar(@NonNull Long id) {
        multaRepository.deleteById(id);
    }
}
