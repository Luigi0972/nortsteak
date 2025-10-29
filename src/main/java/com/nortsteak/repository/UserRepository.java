package com.nortsteak.repository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.nortsteak.models.User;


@Repository
public interface UserRepository extends CrudRepository<User, Integer> {
    User findByNombre(String nombre);

    User findByCorreoElectronico(String correoElectronico);
    
}
 