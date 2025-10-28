package com.nortsteak.controller;

import com.nortsteak.models.User;
import com.nortsteak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> userData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String nombre = userData.get("nombre");
            String apellido = userData.get("apellido");
            String correo = userData.get("correo");
            String contrasena = userData.get("contrasena");
            String direccion = userData.get("direccion");
            
            // Verificar si el usuario ya existe
            User existingUser = userRepository.findByCorreoElectronico(correo);
            if (existingUser != null) {
                response.put("status", "error");
                response.put("message", "El correo electrónico ya está registrado");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Crear nuevo usuario
            User newUser = new User();
            newUser.setNombre(nombre);
            newUser.setApellido(apellido);
            newUser.setCorreoElectronico(correo);
            newUser.setContrasena(passwordEncoder.encode(contrasena));
            newUser.setDireccion(direccion);
            newUser.setRol("ROLE_USER"); // Rol por defecto

            try {
                userRepository.save(newUser);
            } catch (DataIntegrityViolationException e) {
                response.put("status", "error");
                response.put("message", "El correo electrónico ya está registrado");
                return ResponseEntity.badRequest().body(response);
            }
            
            response.put("status", "success");
            response.put("message", "Usuario registrado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String correo = loginData.get("correo");
            String contrasena = loginData.get("contrasena");
            
            // Buscar usuario por correo
            User user = userRepository.findByCorreoElectronico(correo);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "Credenciales incorrectas");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Verificar contraseña
            if (passwordEncoder.matches(contrasena, user.getContrasena())) {
                response.put("status", "success");
                response.put("message", "Inicio de sesión exitoso");
                response.put("user", Map.of(
                    "nombre", user.getNombre(),
                    "apellido", user.getApellido(),
                    "correo", user.getCorreoElectronico()
                ));
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Credenciales incorrectas");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}