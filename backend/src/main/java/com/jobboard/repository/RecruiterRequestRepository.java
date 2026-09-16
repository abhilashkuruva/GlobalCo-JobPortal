package com.jobboard.repository;

import com.jobboard.entity.RecruiterRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterRequestRepository extends JpaRepository<RecruiterRequest, Long> {
    List<RecruiterRequest> findAllByOrderByCreatedAtDesc();
    List<RecruiterRequest> findByStatusOrderByCreatedAtDesc(String status);
    Optional<RecruiterRequest> findByUserId(Long userId);
    Optional<RecruiterRequest> findByUsername(String username);
    Optional<RecruiterRequest> findByEmail(String email);
    long countByStatus(String status);
}
