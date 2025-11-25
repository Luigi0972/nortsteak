package com.nortsteak.dto;

import com.nortsteak.models.User;
import lombok.Data;

@Data
public class UserProfileDTO {
    private int id;
    private String nombre;
    private String apellido;
    private String correo;
    private String telefono;
    private String direccion;

    public static UserProfileDTO fromUser(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId_cliente());
        dto.setNombre(user.getNombre());
        dto.setApellido(user.getApellido());
        dto.setCorreo(user.getCorreoElectronico());
        dto.setTelefono(user.getTelefono());
        dto.setDireccion(user.getDireccion());
        return dto;
    }
}

