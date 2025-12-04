package com.nortsteak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.nortsteak.repository.ProductoRepository;
import com.nortsteak.models.Producto;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpSession;

@Controller
public class controller {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping("/")
    public String index(Model model, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        boolean isAdmin = "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail);

        // Obtener productos destacados desde la base de datos
        List<Producto> todosProductos = productoRepository.findAll();
        Map<String, Producto> productosDestacados = new HashMap<>();
        
        // Buscar los productos destacados por nombre
        String[] nombresDestacados = {"Corte New York", "New York", "Tomahawk", "Filete Mignon"};
        for (Producto producto : todosProductos) {
            for (String nombre : nombresDestacados) {
                if (producto.getNombreProducto().contains(nombre) || nombre.contains(producto.getNombreProducto())) {
                    if (nombre.equals("Corte New York") || nombre.equals("New York")) {
                        productosDestacados.put("Corte New York", producto);
                    } else if (nombre.equals("Tomahawk")) {
                        productosDestacados.put("Corte Tomahawk", producto);
                    } else if (nombre.equals("Filete Mignon")) {
                        productosDestacados.put("Corte Filete Mignon", producto);
                    }
                    break;
                }
            }
        }

        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("userEmail", userEmail);
        model.addAttribute("productosDestacados", productosDestacados);
        // busca index.html en resources/templates
        return "index";
    }

    @GetMapping("/index2")
    public String adminLanding(Model model, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        boolean isAdmin = "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail);

        if (!isAdmin) {
            return "redirect:/";
        }

        model.addAttribute("userEmail", userEmail);
        return "index2";
    }
}
