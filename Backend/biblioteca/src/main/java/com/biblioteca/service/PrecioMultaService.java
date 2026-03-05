package com.biblioteca.service;

import com.biblioteca.entity.PrecioMulta;
import org.springframework.lang.NonNull;
import java.util.List;

public interface PrecioMultaService {
    PrecioMulta crear(@NonNull PrecioMulta precioMulta);
    PrecioMulta obtenerPorId(@NonNull Long id);
    List<PrecioMulta> listar();
    PrecioMulta actualizar(@NonNull Long id, @NonNull PrecioMulta precioMulta);
    void eliminar(@NonNull Long id);

    PrecioMulta obtenerPrecioVigente();
}
