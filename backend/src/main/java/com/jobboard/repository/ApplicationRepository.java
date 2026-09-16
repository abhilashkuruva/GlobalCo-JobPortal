package com.jobboard.repository;

import com.jobboard.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidate_Id(Long candidateId, Pageable pageable);
    
    List<Application> findByCandidate_Id(Long candidateId);

    default Page<Application> findByCandidateId(Long candidateId, Pageable pageable) {
        return findByCandidate_Id(candidateId, pageable);
    }

    List<Application> findByJob_Id(Long jobId);
    
    Page<Application> findByJob_Id(Long jobId, Pageable pageable);

    default List<Application> findByJobId(Long jobId) {
        return findByJob_Id(jobId);
    }

    boolean existsByJob_IdAndCandidate_Id(Long jobId, Long candidateId);

    long countByCandidate_Id(Long candidateId);

    long countByJob_Id(Long jobId);

    long countByStatus(String status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.candidate.id = :candidateId AND a.status = :status")
    long countByCandidateIdAndStatus(@Param("candidateId") Long candidateId, @Param("status") String status);

    @Query("SELECT a FROM Application a WHERE a.job.recruiterId = :recruiterId")
    List<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiterId = :recruiterId")
    long countByRecruiterId(@Param("recruiterId") Long recruiterId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.job.recruiterId = :recruiterId AND a.status = :status")
    long countByRecruiterIdAndStatus(@Param("recruiterId") Long recruiterId, @Param("status") String status);
}