package com.nortsteak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.nortsteak.repository.ProductoRepository;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Controller
public class PaginasController {

    @Autowired
    private ProductoRepository productoRepository;

    // Mapeo de nombres de productos a imágenes
    private Map<String, String> crearMapeoImagenes() {
        Map<String, String> mapeoImagenes = new HashMap<>();
        mapeoImagenes.put("Corte New York", "/img2/newyork.jpg");
        mapeoImagenes.put("New York", "/img2/newyork.jpg");
        mapeoImagenes.put("Tomahawk", "/img2/tomahawk.jpg");
        mapeoImagenes.put("Filete Mignon", "/img2/milegnon.jpg");
        mapeoImagenes.put("Lomo de res", "/img2/lomores.jpg");
        mapeoImagenes.put("Ribeye", "/img2/ribeye.jpg");
        mapeoImagenes.put("Picaña", "/img2/picaña.jpg");
        mapeoImagenes.put("T-Bone", "/img2/tbone.jpg");
        mapeoImagenes.put("Brisket", "/img2/brisket.jpg");
        mapeoImagenes.put("Churrasco", "/img2/churrasco.jpg");
        return mapeoImagenes;
    }

    // Catálogo
    @GetMapping("/catalogo")
    public String catalogo(Model model) {
        List<com.nortsteak.models.Producto> productos = productoRepository.findAll();
        Map<String, String> mapeoImagenes = crearMapeoImagenes();
        model.addAttribute("productos", productos);
        model.addAttribute("mapeoImagenes", mapeoImagenes);
        return "catalogo"; // busca templates/catalogo.html
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

    // Registro
    @GetMapping("/registro")
    public String registro() {
        return "registro"; // busca templates/registro.html
    }

}
