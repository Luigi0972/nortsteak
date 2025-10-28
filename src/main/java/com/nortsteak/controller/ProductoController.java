package com.nortsteak.controller;

import com.nortsteak.model.Producto;
import com.nortsteak.repository.ProductoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*") // permite que tu frontend consuma los endpoints
public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // Obtener todos los productos
    @GetMapping
    public List<Producto> getAll() {
        return productoRepository.findAll();
    }

    // Buscar productos por nombre (ej: /api/productos/buscar?nombre=Ribeye)
    @GetMapping("/buscar")
    public List<Producto> buscarPorNombre(@RequestParam String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    // Crear un producto
    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoRepository.save(producto);
    }
}
