package com.jobboard.repository;

import com.jobboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findFirstByUsername(String username);
    java.util.List<User> findAllByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    java.util.List<User> findByRoles_Name(String roleName);
    long countByRoles_Name(String roleName);
    long countByRoles_NameAndAccountStatus(String roleName, String accountStatus);
}