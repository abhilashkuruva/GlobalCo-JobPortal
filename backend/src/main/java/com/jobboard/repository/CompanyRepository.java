package com.jobboard.repository;

import com.jobboard.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    java.util.Optional<Company> findByNameIgnoreCase(String name);
}
