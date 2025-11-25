package com.nortsteak.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String direccion;
}

