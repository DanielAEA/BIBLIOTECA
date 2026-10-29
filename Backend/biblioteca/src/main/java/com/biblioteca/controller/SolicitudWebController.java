package com.biblioteca.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class SolicitudWebController {

    @Value("${app.front.url:http://localhost:4200}")
    private String frontUrl;

    @GetMapping("/solicitar/{id}")
    public RedirectView redireccionarASolicitudLibro(@PathVariable @NonNull String id) {
        String url = frontUrl.endsWith("/") ? frontUrl.substring(0, frontUrl.length() - 1) : frontUrl;
        return new RedirectView(url + "/solicitar/" + id);
    }

    @GetMapping("/solicitar-ejemplar/{id}")
    public RedirectView redireccionarASolicitudEjemplar(@PathVariable @NonNull String id) {
        String url = frontUrl.endsWith("/") ? frontUrl.substring(0, frontUrl.length() - 1) : frontUrl;
        return new RedirectView(url + "/solicitar-ejemplar/" + id);
    }
}
