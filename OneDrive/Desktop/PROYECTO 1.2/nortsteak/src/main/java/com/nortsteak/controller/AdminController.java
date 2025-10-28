package com.nortsteak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.nortsteak.models.Producto;
import com.nortsteak.repository.ProductoRepository;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping("/panel")
    public String mostrarPanelAdmin(Model model) {
        List<Producto> productos = productoRepository.findAll();
        model.addAttribute("productos", productos);
        return "admin"; // Esto busca admin.html en templates/
    }

    @PostMapping("/actualizarStock")
    public String actualizarStock(@RequestParam("id") Long id,
            @RequestParam("nuevoStock") int nuevoStock) {
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setStock(nuevoStock);
            productoRepository.save(producto);
        }
        return "redirect:/admin/panel";
    }
}