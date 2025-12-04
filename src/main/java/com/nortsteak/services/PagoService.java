package com.nortsteak.services;

import com.nortsteak.dto.SimulatedPaymentRequest;
import com.nortsteak.dto.SimulatedPaymentResponse;
import com.nortsteak.models.*;
import com.nortsteak.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PagoService {

    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final UserRepository userRepository;

    public PagoService(ProductoRepository productoRepository, 
                       PedidoRepository pedidoRepository,
                       ItemPedidoRepository itemPedidoRepository,
                       UserRepository userRepository) {
        this.productoRepository = productoRepository;
        this.pedidoRepository = pedidoRepository;
        this.itemPedidoRepository = itemPedidoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SimulatedPaymentResponse procesarPagoSimulado(SimulatedPaymentRequest request) {
        validarRequest(request);

        List<SimulatedPaymentResponse.DetalleItem> detalles = new ArrayList<>();
        double total = 0;

        for (SimulatedPaymentRequest.ItemCompra item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con id " + item.getProductoId()));

            if (item.getCantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad debe ser mayor a cero para " + producto.getNombreProducto());
            }

            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para " + producto.getNombreProducto());
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            double subtotal = producto.getPrecioProducto() * item.getCantidad();
            total += subtotal;

            SimulatedPaymentResponse.DetalleItem detalle = new SimulatedPaymentResponse.DetalleItem();
            detalle.setProductoId(producto.getIdProducto());
            detalle.setNombreProducto(producto.getNombreProducto());
            detalle.setCantidad(item.getCantidad());
            detalle.setSubtotal(subtotal);
            detalle.setStockRestante(producto.getStock());
            detalles.add(detalle);
        }

        SimulatedPaymentResponse response = new SimulatedPaymentResponse();
        response.setMensaje("Pago simulado exitoso. Inventario actualizado.");
        response.setMetodo(request.getMetodo());
        response.setReferencia(request.getReferencia());
        response.setComprador(request.getNombre());
        response.setTotalProcesado(total);
        response.setFecha(LocalDateTime.now());
        response.setItems(detalles);

        if (Math.abs(total - request.getTotalEsperado()) > 1e-2) {
            response.setMensaje(response.getMensaje() + " (total recalculado por el servidor)");
        }

        // Guardar el pedido en la base de datos
        guardarPedido(request, detalles, total);

        return response;
    }

    private void guardarPedido(SimulatedPaymentRequest request, 
                               List<SimulatedPaymentResponse.DetalleItem> detalles,
                               double total) {
        // Buscar el cliente por correo si existe
        User cliente = userRepository.findByCorreoElectronico(request.getCorreo());

        // Crear el pedido
        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setNombreCliente(request.getNombre());
        pedido.setDireccion(request.getDireccion());
        pedido.setTelefono(request.getTelefono());
        pedido.setCorreo(request.getCorreo());
        pedido.setMetodoPago(request.getMetodo());
        pedido.setReferenciaPago(request.getReferencia());
        pedido.setTotal(total);
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");

        // Guardar el pedido primero para obtener el ID
        pedido = pedidoRepository.save(pedido);

        // Crear los items del pedido
        List<ItemPedido> itemsPedido = new ArrayList<>();
        for (SimulatedPaymentResponse.DetalleItem detalle : detalles) {
            Producto producto = productoRepository.findById(detalle.getProductoId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProducto(producto);
            item.setCantidad(detalle.getCantidad());
            // Usar el precio del detalle que ya fue calculado antes de modificar el stock
            item.setPrecioUnitario(detalle.getSubtotal() / detalle.getCantidad());
            item.setSubtotal(detalle.getSubtotal());
            
            itemsPedido.add(item);
        }

        // Guardar todos los items
        itemPedidoRepository.saveAll(itemsPedido);
        
        // Actualizar el pedido con los items
        pedido.setItems(itemsPedido);
        pedidoRepository.save(pedido);
    }

    private void validarRequest(SimulatedPaymentRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("No se recibió información del pago.");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("No hay productos para procesar.");
        }
        if (request.getMetodo() == null || request.getMetodo().isBlank()) {
            throw new IllegalArgumentException("Debes seleccionar un método de pago.");
        }
        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio.");
        }
        if (request.getCedula() == null || request.getCedula().isBlank()) {
            throw new IllegalArgumentException("La cédula es obligatoria.");
        }
    }
}


