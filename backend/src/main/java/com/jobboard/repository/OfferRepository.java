package com.jobboard.repository;

import com.jobboard.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findByApplication_Id(Long applicationId);

    default Optional<Offer> findByApplicationId(Long applicationId) {
        return findByApplication_Id(applicationId);
    }
}