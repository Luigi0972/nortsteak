package com.nortsteak.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.nortsteak.models.SecurityUser;
import com.nortsteak.models.User;
import com.nortsteak.repository.UserRepository;

@Service
public class UserServicesDetails implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Buscar por correo electrónico (que es lo que normalmente se usa como username)
        User user = userRepository.findByCorreoElectronico(username);
        if (user == null) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + username);
        }
        return new SecurityUser(user);
    }
}
