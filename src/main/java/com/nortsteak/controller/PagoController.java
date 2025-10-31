package com.nortsteak.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/pago")
@CrossOrigin(origins = "http://localhost:5500") // Ajusta según tu puerto del front
public class PagoController {

    @PostMapping
    public Map<String, Object> procesarPago(@RequestBody Map<String, Object> datos) {
        System.out.println("Datos recibidos del cliente:");
        System.out.println(datos);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Pago procesado correctamente");
        respuesta.put("estado", "OK");
        respuesta.put("total", datos.get("total"));
        respuesta.put("productos", datos.get("productos"));
        respuesta.put("fecha", new Date());

        return respuesta;
    }
}
