package com.nortsteak.repository;

import com.nortsteak.models.Pedido;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends CrudRepository<Pedido, Long> {
    List<Pedido> findAllByOrderByFechaPedidoDesc();
    List<Pedido> findByCorreoOrderByFechaPedidoDesc(String correo);
}

