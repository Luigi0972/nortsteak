package com.nortsteak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.nortsteak.models.Producto;
import com.nortsteak.repository.ProductoRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping("/panel")
    public String mostrarPanelAdmin(Model model, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        
        // Verificar que el usuario esté logueado y sea el admin
        if (userEmail == null || !"sebasmondragon@gmail.com".equals(userEmail)) {
            return "redirect:/";
        }
        
        List<Producto> productos = productoRepository.findAll();
        model.addAttribute("productos", productos);
        return "admin"; // Esto busca admin.html en templates/
    }

    @PostMapping("/actualizarStock")
    public String actualizarStock(@RequestParam("id") Long id,
            @RequestParam("nuevoStock") int nuevoStock, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null || !"sebasmondragon@gmail.com".equals(userEmail)) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setStock(nuevoStock);
            productoRepository.save(producto);
        }
        return "redirect:/admin/panel";
    }

    @PostMapping("/actualizarPrecio")
    public String actualizarPrecio(@RequestParam("id") Long id,
            @RequestParam("nuevoPrecio") double nuevoPrecio, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null || !"sebasmondragon@gmail.com".equals(userEmail)) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setPrecioProducto(nuevoPrecio);
            productoRepository.save(producto);
        }
        return "redirect:/admin/panel";
    }

    @PostMapping("/actualizarProducto")
    public String actualizarProducto(@RequestParam("id") Long id,
            @RequestParam("nuevoStock") int nuevoStock,
            @RequestParam("nuevoPrecio") double nuevoPrecio, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null || !"sebasmondragon@gmail.com".equals(userEmail)) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setStock(nuevoStock);
            producto.setPrecioProducto(nuevoPrecio);
            productoRepository.save(producto);
        }
        return "redirect:/admin/panel";
    }
}