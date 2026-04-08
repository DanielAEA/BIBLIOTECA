package com.biblioteca.controller;

import com.biblioteca.entity.Libro;
import com.biblioteca.entity.Ejemplar;
import com.biblioteca.repository.LibroRepository;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class SolicitudWebController {

    private final LibroRepository libroRepository;

    public SolicitudWebController(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    @GetMapping(value = "/solicitar/{id}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String obtenerPaginaSolicitudLibro(@PathVariable @NonNull String id) {
        return obtenerPaginaSolicitudEjemplar(id);
    }

    @GetMapping(value = "/solicitar-ejemplar/{id}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String obtenerPaginaSolicitudEjemplar(@PathVariable @NonNull String id) {
        // 1. Intentar buscar por ID de ejemplar
        Libro libro = libroRepository.findByEjemplarId(id).orElse(null);
        
        // 2. Si no se encuentra, intentar buscar por ID de libro directamente (por si el QR es de libro)
        if (libro == null) {
            libro = libroRepository.findById(id).orElse(null);
        }

        String titulo = (libro != null) ? libro.getTitulo() : "Libro no encontrado";
        String libroId = (libro != null) ? libro.getId() : "";
        String codigoEjemplar = "N/A";
        
        if (libro != null && libro.getEjemplares() != null) {
            for (Ejemplar e : libro.getEjemplares()) {
                if (id.equals(e.getId())) {
                    codigoEjemplar = e.getCodigo();
                    break;
                }
            }
        }
        
        return "<!DOCTYPE html><html lang='es'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<title>Solicitar préstamo</title>" +
            "<style>" +
            "* { box-sizing: border-box; margin: 0; padding: 0; }" +
            "body { font-family: Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 1rem; }" +
            ".card { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 400px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }" +
            "h1 { font-size: 20px; margin-bottom: 4px; color: #111; text-align: center; }" +
            ".libro { font-size: 14px; color: #666; margin-bottom: 4px; text-align: center; }" +
            ".copia { font-size: 12px; color: #003366; font-weight: bold; margin-bottom: 1.5rem; text-transform: uppercase; text-align: center; }" +
            "label { display: block; font-size: 13px; color: #555; margin-bottom: 4px; margin-top: 12px; font-weight: 600; }" +
            "input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }" +
            "button { width: 100%; margin-top: 1.5rem; padding: 12px; background: #1a1a2e; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; }" +
            "button:disabled { opacity: 0.5; }" +
            "#mensaje { margin-top: 1rem; padding: 10px; border-radius: 8px; font-size: 14px; display: none; text-align: center; font-weight: 500; }" +
            ".exito { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }" +
            ".error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }" +
            "</style></head><body>" +
            "<div class='card'>" +
            "<h1>Solicitar préstamo</h1>" +
            "<p class='libro'>" + titulo + "</p>" +
            "<p class='copia'>Copia: " + codigoEjemplar + "</p>" +
            "<label>Nombre completo</label>" +
            "<input type='text' id='nombre' placeholder='Tu nombre completo' />" +
            "<label>Correo electrónico</label>" +
            "<input type='email' id='email' placeholder='tu@correo.com' />" +
            "<label>¿Cuántos días quieres prestarlo? (1-30)</label>" +
            "<input type='number' id='dias' min='1' max='30' value='15' />" +
            "<button id='btnEnviar' onclick='enviar()'>Solicitar préstamo</button>" +
            "<div id='mensaje'></div>" +
            "</div>" +
            "<script>" +
            "async function enviar() {" +
            "  var nombre = document.getElementById('nombre').value;" +
            "  var email = document.getElementById('email').value;" +
            "  var dias = document.getElementById('dias').value;" +
            "  var msg = document.getElementById('mensaje');" +
            "  var btn = document.getElementById('btnEnviar');" +
            "  if (!nombre || !email || !dias) { msg.className='error'; msg.style.display='block'; msg.textContent='Por favor completa todos los campos.'; return; }" +
            "  btn.disabled = true; btn.textContent = 'Enviando...';" +
            "  try {" +
            "    const r = await fetch('/api/solicitudes/nueva', {" +
            "      method: 'POST'," +
            "      headers: { 'Content-Type': 'application/json' }," +
            "      body: JSON.stringify({ " +
            "         libroId: '" + libroId + "', " +
            "         ejemplarId: '" + id + "', " +
            "         codigoEjemplar: '" + codigoEjemplar + "', " +
            "         tituloLibro: '" + titulo + "', " +
            "         nombreCliente: nombre, " +
            "         emailCliente: email, " +
            "         diasPrestamo: parseInt(dias), " +
            "         estado: 'PENDIENTE' " +
            "      })" +
            "    });" +
            "    msg.style.display='block';" +
            "    if (r.ok) {" +
            "      msg.className='exito'; msg.textContent='¡Solicitud enviada con éxito!';" +
            "      document.getElementById('nombre').value=''; document.getElementById('email').value='';" +
            "    } else {" +
            "      msg.className='error'; msg.textContent='Solo usuarios registrados pueden solicitar préstamos.';" +
            "    }" +
            "  } catch(e) {" +
            "    msg.className='error'; msg.textContent='Error de conexión.'; msg.style.display='block'; " +
            "  } finally {" +
            "    btn.disabled = false; btn.textContent = 'Solicitar préstamo';" +
            "  }" +
            "}" +
            "</script></body></html>";
    }
}
