package com.myproject.studynow.repository;

import com.myproject.studynow.entity.Role;
import com.myproject.studynow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);


}