package com.jobboard.repository;

import com.jobboard.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplication_Id(Long applicationId);
    
    default List<Interview> findByApplicationId(Long applicationId) {
        return findByApplication_Id(applicationId);
    }

    List<Interview> findByInterviewer_Id(Long interviewerId);
}