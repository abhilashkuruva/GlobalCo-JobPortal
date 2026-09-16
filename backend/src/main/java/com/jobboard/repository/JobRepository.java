package com.jobboard.repository;

import com.jobboard.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @EntityGraph(attributePaths = {"company", "category", "skills"})
    @Query("SELECT j FROM Job j WHERE j.status IN ('ACTIVE', 'APPROVED', 'PUBLISHED') AND (:status IS NULL OR :status IS NOT NULL) " +
           "AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(j.company.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minExp IS NULL OR j.experienceRequired >= :minExp) " +
           "AND (:workMode IS NULL OR LOWER(j.workMode) = LOWER(:workMode)) " +
           "AND (:categoryName IS NULL OR LOWER(j.category.name) = LOWER(:categoryName))")
    Page<Job> searchJobsAdvanced(
            @Param("status") String status,
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("minExp") Integer minExp,
            @Param("workMode") String workMode,
            @Param("categoryName") String categoryName,
            Pageable pageable);

    @EntityGraph(attributePaths = {"company", "category", "skills"})
    @Query("SELECT j FROM Job j WHERE j.status IN ('ACTIVE', 'APPROVED', 'PUBLISHED') AND (:status IS NULL OR :status IS NOT NULL) " +
           "AND (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(j.description) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:minExp IS NULL OR j.experienceRequired >= :minExp)")
    Page<Job> searchJobs(@Param("status") String status, 
                        @Param("title") String title, 
                        @Param("location") String location, 
                        @Param("minExp") Integer minExp, 
                        Pageable pageable);

    Page<Job> findByRecruiterId(Long recruiterId, Pageable pageable);

    List<Job> findByRecruiterId(Long recruiterId);

    long countByRecruiterId(Long recruiterId);

    long countByStatus(String status);

    boolean existsByRecruiterIdAndId(Long recruiterId, Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM saved_jobs WHERE job_id = :jobId", nativeQuery = true)
    void deleteSavedJobLinks(@Param("jobId") Long jobId);
}
