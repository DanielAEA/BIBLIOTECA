package com.biblioteca.controller;

import com.biblioteca.entity.ReservaSala;
import com.biblioteca.service.ReservaSalaService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas-sala")
@CrossOrigin(origins = "*")
public class ReservaSalaController {

    private final ReservaSalaService reservaSalaService;

    public ReservaSalaController(ReservaSalaService reservaSalaService) {
        this.reservaSalaService = reservaSalaService;
    }

    @GetMapping
    public List<ReservaSala> listar() {
        return reservaSalaService.listar();
    }

    @GetMapping("/{id}")
    public ReservaSala obtener(@PathVariable Long id) {
        return reservaSalaService.obtenerPorId(id);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<ReservaSala> listarPorUsuario(@PathVariable Long usuarioId) {
        return reservaSalaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/sala/{salaId}")
    public List<ReservaSala> listarPorSala(@PathVariable Long salaId) {
        return reservaSalaService.listarPorSala(salaId);
    }

    @GetMapping("/sala/{salaId}/fecha/{fecha}")
    public List<ReservaSala> listarPorSalaYFecha(
            @PathVariable Long salaId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return reservaSalaService.listarPorSalaYFecha(salaId, fecha);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ReservaSala reserva) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(reservaSalaService.crear(reserva));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ReservaSala actualizar(@PathVariable Long id, @RequestBody ReservaSala reserva) {
        return reservaSalaService.actualizar(id, reserva);
    }

    @PatchMapping("/{id}/estado")
    public ReservaSala cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return reservaSalaService.cambiarEstado(id, body.get("estado"));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        reservaSalaService.eliminar(id);
    }
}
