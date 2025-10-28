package com.nortsteak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class controller {

    @GetMapping("/")
    public String index() {
        // busca index.html en resources/templates
        return "index";
    }

    @GetMapping("/buscar")
    public String buscar(@RequestParam(required = false) String q) {
        // Si hay una consulta, redirigir al catálogo con el parámetro
        if (q != null && !q.isEmpty()) {
            return "redirect:/catalogo?producto=" + q;
        }
        // Si no hay consulta, redirigir al catálogo sin parámetros
        return "redirect:/catalogo";
    }
}
