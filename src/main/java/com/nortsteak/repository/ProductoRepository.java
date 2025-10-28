package com.nortsteak.repository;

import com.nortsteak.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    // Método para buscar por nombre
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
