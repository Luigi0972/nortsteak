package com.nortsteak.services;

import com.nortsteak.dto.SimulatedPaymentRequest;
import com.nortsteak.dto.SimulatedPaymentResponse;
import com.nortsteak.models.Producto;
import com.nortsteak.repository.ProductoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PagoService {

    private final ProductoRepository productoRepository;

    public PagoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
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

        return response;
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


