package com.nortsteak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaginasController {

    // Catálogo
    @GetMapping("/catalogo")
    public String catalogo() {
        return "catalogo"; // busca templates/catalogo.html
    }

    // Login
    @GetMapping("/login2")
    public String login() {
        return "login2"; // busca templates/login.html
    }

    // Registro
    @GetMapping("/registro")
    public String registro() {
        return "registro"; // busca templates/registro.html
    }

    // Pasarela de pagos
    @GetMapping("/pasarela")
    public String pasarela() {
        return "pasarela"; // busca templates/pasarela.html
    }

    // Carrito de compras
    @GetMapping("/carrito")
    public String carrito() {
        return "carrito_compras"; // busca templates/carrito_compras.html
    }

    // Sobre nosotros
    @GetMapping("/sobreNosotros")
    public String sobreNosotros() {
        return "sobreNosotros"; // busca templates/sobreNosotros.html
    }

    // Callback (si lo necesitas)
    @GetMapping("/callback")
    public String callback() {
        return "callback"; // busca templates/callback.html
    }
}
