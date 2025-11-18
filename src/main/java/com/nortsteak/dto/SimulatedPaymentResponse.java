package com.nortsteak.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SimulatedPaymentResponse {

    private String mensaje;
    private String metodo;
    private String referencia;
    private String comprador;
    private double totalProcesado;
    private LocalDateTime fecha;
    private List<DetalleItem> items;

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getComprador() {
        return comprador;
    }

    public void setComprador(String comprador) {
        this.comprador = comprador;
    }

    public double getTotalProcesado() {
        return totalProcesado;
    }

    public void setTotalProcesado(double totalProcesado) {
        this.totalProcesado = totalProcesado;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public List<DetalleItem> getItems() {
        return items;
    }

    public void setItems(List<DetalleItem> items) {
        this.items = items;
    }

    public static class DetalleItem {
        private Long productoId;
        private String nombreProducto;
        private int cantidad;
        private double subtotal;
        private int stockRestante;

        public Long getProductoId() {
            return productoId;
        }

        public void setProductoId(Long productoId) {
            this.productoId = productoId;
        }

        public String getNombreProducto() {
            return nombreProducto;
        }

        public void setNombreProducto(String nombreProducto) {
            this.nombreProducto = nombreProducto;
        }

        public int getCantidad() {
            return cantidad;
        }

        public void setCantidad(int cantidad) {
            this.cantidad = cantidad;
        }

        public double getSubtotal() {
            return subtotal;
        }

        public void setSubtotal(double subtotal) {
            this.subtotal = subtotal;
        }

        public int getStockRestante() {
            return stockRestante;
        }

        public void setStockRestante(int stockRestante) {
            this.stockRestante = stockRestante;
        }
    }
}


