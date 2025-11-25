package com.nortsteak.controller;

import com.nortsteak.dto.UpdateProfileRequest;
import com.nortsteak.dto.UserProfileDTO;
import com.nortsteak.models.User;
import com.nortsteak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🔹 REGISTRO DE USUARIO
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, String> userData) {
        Map<String, Object> response = new HashMap<>();

        try {
            String nombre = userData.get("nombre");
            String apellido = userData.get("apellido");
            String correo = userData.get("correo");
            String contrasena = userData.get("contrasena");
            String direccion = userData.get("direccion");
            String telefono = userData.get("telefono");

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
            newUser.setTelefono(telefono);
            newUser.setRol("ROLE_USER"); // Rol por defecto

            userRepository.save(newUser);

            response.put("status", "success");
            response.put("message", "Usuario registrado exitosamente");
            return ResponseEntity.ok(response);

        } catch (DataIntegrityViolationException e) {
            response.put("status", "error");
            response.put("message", "El correo electrónico ya está registrado");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // 🔹 INICIO DE SESIÓN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> loginData, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String correo = loginData.get("correo");
            String contrasena = loginData.get("contrasena");

            // Buscar usuario por correo
            User user = userRepository.findByCorreoElectronico(correo);
            if (user == null) {
                response.put("status", "error");
                response.put("message", "El usuario no está registrado");
                return ResponseEntity.badRequest().body(response);
            }

            // Verificar contraseña
            if (!passwordEncoder.matches(contrasena, user.getContrasena())) {
                response.put("status", "error");
                response.put("message", "Contraseña incorrecta");
                return ResponseEntity.badRequest().body(response);
            }

            // Guardar información en sesión
            session.setAttribute("userEmail", user.getCorreoElectronico());
            session.setAttribute("userNombre", user.getNombre());
            session.setAttribute("userId", user.getId_cliente());

            response.put("status", "success");
            response.put("message", "Inicio de sesión exitoso");
            response.put("user", Map.of(
                    "nombre", user.getNombre(),
                    "apellido", user.getApellido(),
                    "correo", user.getCorreoElectronico(),
                    "telefono", user.getTelefono(),
                    "direccion", user.getDireccion()
            ));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // 🔹 CONSULTAR SESIÓN ACTIVA
    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> getSession(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        String userEmail = (String) session.getAttribute("userEmail");

        if (userEmail != null) {
            response.put("loggedIn", true);
            response.put("userEmail", userEmail);
            response.put("userNombre", session.getAttribute("userNombre"));
        } else {
            response.put("loggedIn", false);
        }

        return ResponseEntity.ok(response);
    }

    // 🔹 CERRAR SESIÓN
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Sesión cerrada exitosamente");
        return ResponseEntity.ok(response);
    }

    // 🔹 PERFIL DEL USUARIO AUTENTICADO
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpSession session) {
        Optional<User> userOptional = resolveUserFromSession(session);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "message", "No hay una sesión activa"));
        }
        return ResponseEntity.ok(UserProfileDTO.fromUser(userOptional.get()));
    }

    // 🔹 ACTUALIZAR PERFIL
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, HttpSession session) {
        Optional<User> userOptional = resolveUserFromSession(session);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("status", "error", "message", "No hay una sesión activa"));
        }

        User user = userOptional.get();
        if (request.getNombre() == null || request.getNombre().isBlank() ||
                request.getCorreo() == null || request.getCorreo().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", "Nombre y correo son obligatorios"));
        }

        User userWithSameEmail = userRepository.findByCorreoElectronico(request.getCorreo());
        if (userWithSameEmail != null && userWithSameEmail.getId_cliente() != user.getId_cliente()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", "error", "message", "El correo ya está en uso por otro usuario"));
        }

        user.setNombre(request.getNombre());
        user.setApellido(request.getApellido() != null ? request.getApellido() : user.getApellido());
        user.setCorreoElectronico(request.getCorreo());
        if (request.getTelefono() != null) {
            user.setTelefono(request.getTelefono());
        }
        if (request.getDireccion() != null) {
            user.setDireccion(request.getDireccion());
        }

        userRepository.save(user);

        session.setAttribute("userNombre", user.getNombre());
        session.setAttribute("userEmail", user.getCorreoElectronico());

        return ResponseEntity.ok(UserProfileDTO.fromUser(user));
    }

    private Optional<User> resolveUserFromSession(HttpSession session) {
        if (session == null) {
            return Optional.empty();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return Optional.empty();
        }
        return userRepository.findById(userId);
    }
}
