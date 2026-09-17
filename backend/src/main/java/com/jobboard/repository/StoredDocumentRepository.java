package com.jobboard.repository;

import com.jobboard.entity.StoredDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoredDocumentRepository extends JpaRepository<StoredDocument, Long> {
    Optional<StoredDocument> findByFileKey(String fileKey);
    boolean existsByFileKey(String fileKey);
}
