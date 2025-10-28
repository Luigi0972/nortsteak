package com.nortsteak.models;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table (name = "cliente")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {
    @Id
    @GeneratedValue
    private int id_cliente;
    private String nombre;
    private String apellido;
    private String correoElectronico;
    private String contrasena;
    private String direccion;
    private String rol;

}
