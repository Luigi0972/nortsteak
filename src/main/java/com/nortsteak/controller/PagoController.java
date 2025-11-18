package com.nortsteak.controller;

import com.nortsteak.dto.SimulatedPaymentRequest;
import com.nortsteak.dto.SimulatedPaymentResponse;
import com.nortsteak.services.PagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pago")
@CrossOrigin(origins = "*")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/simulado")
    public ResponseEntity<?> procesarPagoSimulado(@RequestBody SimulatedPaymentRequest request) {
        try {
            SimulatedPaymentResponse response = pagoService.procesarPagoSimulado(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", ex.getMessage()));
        }
    }
}
