package com.nortsteak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login2")
    public String showLoginForm() {
        return "login2"; // Crea un template login.html
    }
}