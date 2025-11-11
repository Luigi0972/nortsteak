package com.nortsteak.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.HttpSession;

@Controller
public class controller {

    @GetMapping("/")
    public String index(Model model, HttpSession session) {
        String userEmail = (String) session.getAttribute("userEmail");
		boolean isAdmin = "luigi0972@gmail.com".equals(userEmail) || "sebasmondragon@gmail.com".equals(userEmail);
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("userEmail", userEmail);
        // busca index.html en resources/templates
        return "index";
    }
}
