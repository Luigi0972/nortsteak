package com.nortsteak.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.nortsteak.models.*;
import com.nortsteak.repository.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/panel")
    public String mostrarPanelAdmin(Model model, HttpSession session,
                                    @RequestParam(value = "seccion", defaultValue = "productos") String seccion) {
        String userEmail = (String) session.getAttribute("userEmail");
        
        // Verificar que el usuario esté logueado y sea el admin
		if (userEmail == null || !( "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail) )) {
            return "redirect:/";
        }
        
        model.addAttribute("seccion", seccion);
        
        if ("pedidos".equals(seccion)) {
            List<Pedido> pedidos = pedidoRepository.findAllByOrderByFechaPedidoDesc();
            model.addAttribute("pedidos", pedidos);
        } else if ("usuarios".equals(seccion) || "clientes".equals(seccion)) {
            List<User> clientes = (List<User>) userRepository.findAll();
            model.addAttribute("clientes", clientes);
        } else {
            List<Producto> productos = productoRepository.findAll();
            model.addAttribute("productos", productos);
        }
        
        return "admin"; // Esto busca admin.html en templates/
    }

    @PostMapping("/actualizarStock")
    public String actualizarStock(@RequestParam("id") Long id,
            @RequestParam("nuevoStock") int nuevoStock, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
		if (userEmail == null || !( "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail) )) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setStock(nuevoStock);
            productoRepository.save(producto);
            return "redirect:/admin/panel?seccion=productos&actualizado=true";
        }
        return "redirect:/admin/panel?seccion=productos&error=true";
    }

    @PostMapping("/actualizarPrecio")
    public String actualizarPrecio(@RequestParam("id") Long id,
            @RequestParam("nuevoPrecio") double nuevoPrecio, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
		if (userEmail == null || !( "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail) )) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setPrecioProducto(nuevoPrecio);
            productoRepository.save(producto);
            return "redirect:/admin/panel?seccion=productos&actualizado=true";
        }
        return "redirect:/admin/panel?seccion=productos&error=true";
    }

    @PostMapping("/actualizarProducto")
    public String actualizarProducto(@RequestParam("id") Long id,
            @RequestParam("nuevoStock") int nuevoStock,
            @RequestParam("nuevoPrecio") double nuevoPrecio, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
		if (userEmail == null || !( "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail) )) {
            return "redirect:/";
        }
        
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto != null) {
            producto.setStock(nuevoStock);
            producto.setPrecioProducto(nuevoPrecio);
            productoRepository.save(producto);
            return "redirect:/admin/panel?seccion=productos&actualizado=true";
        }
        return "redirect:/admin/panel?seccion=productos&error=true";
    }

    @PostMapping("/actualizarEstadoPedido")
    public String actualizarEstadoPedido(@RequestParam("id") Long id,
                                         @RequestParam("nuevoEstado") String nuevoEstado,
                                         HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null || !( "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail) )) {
            return "redirect:/";
        }
        
        Pedido pedido = pedidoRepository.findById(id).orElse(null);
        if (pedido != null) {
            pedido.setEstado(nuevoEstado);
            pedidoRepository.save(pedido);
            return "redirect:/admin/panel?seccion=pedidos&actualizado=true";
        }
        return "redirect:/admin/panel?seccion=pedidos&error=true";
    }
}