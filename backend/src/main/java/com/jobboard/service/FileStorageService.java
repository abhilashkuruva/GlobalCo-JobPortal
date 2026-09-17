package com.jobboard.service;

import com.jobboard.entity.StoredDocument;
import com.jobboard.repository.StoredDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Optional;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private final StoredDocumentRepository storedDocumentRepository;

    public FileStorageService(StoredDocumentRepository storedDocumentRepository) {
        this.storedDocumentRepository = storedDocumentRepository;
        // Ensure local directories exist
        try {
            Files.createDirectories(Paths.get("uploads/resumes"));
            Files.createDirectories(Paths.get("uploads/verification_docs"));
        } catch (IOException e) {
            log.warn("Could not initialize upload directories: {}", e.getMessage());
        }
    }

    /**
     * Persists file to both local disk cache and persistent PostgreSQL/Neon database.
     */
    @Transactional
    public void saveDocument(String localDir, String fileKey, String originalName, String category,
                             String contentType, byte[] data) throws IOException {
        // 1. Write to local filesystem cache
        Path dirPath = Paths.get(localDir);
        Files.createDirectories(dirPath);
        Path target = dirPath.resolve(fileKey);
        Files.write(target, data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // 2. Persist in database
        Optional<StoredDocument> existing = storedDocumentRepository.findByFileKey(fileKey);
        StoredDocument doc = existing.orElseGet(StoredDocument::new);
        doc.setFileKey(fileKey);
        doc.setOriginalFileName(originalName != null ? originalName : fileKey);
        doc.setContentType(contentType != null ? contentType : "application/octet-stream");
        doc.setCategory(category);
        doc.setData(data);
        storedDocumentRepository.save(doc);
        log.info("Persisted document '{}' to database and local disk.", fileKey);
    }

    /**
     * Retrieves file path. If file was wiped on local disk (e.g. Render container restart),
     * recovers it from PostgreSQL database and re-caches it locally.
     */
    @Transactional(readOnly = true)
    public Path resolveAndEnsureFile(String localDir, String fileKey) {
        Path dirPath = Paths.get(localDir).toAbsolutePath().normalize();
        Path localFile = dirPath.resolve(fileKey).normalize();

        // 1. Check if present on local disk
        if (Files.exists(localFile)) {
            return localFile;
        }

        // 2. Not on disk: recover from database
        Optional<StoredDocument> docOpt = storedDocumentRepository.findByFileKey(fileKey);
        if (docOpt.isPresent()) {
            StoredDocument doc = docOpt.get();
            if (doc.getData() != null && doc.getData().length > 0) {
                try {
                    Files.createDirectories(dirPath);
                    Files.write(localFile, doc.getData(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                    log.info("Restored document '{}' from database to local filesystem cache.", fileKey);
                    return localFile;
                } catch (IOException e) {
                    log.error("Failed restoring document '{}' to disk: {}", fileKey, e.getMessage());
                }
            }
        }

        return localFile; // Returns path even if missing; caller checks Files.exists
    }

    /**
     * Creates realistic dummy PDF document bytes for sample data seeding.
     */
    public byte[] createSamplePdfContent(String title, String subject) {
        String pdf = "%PDF-1.4\n" +
                "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
                "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
                "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n" +
                "4 0 obj << /Length 120 >> stream\n" +
                "BT /F1 18 Tf 50 720 Td (" + title + ") Tj /F1 12 Tf 0 -30 Td (" + subject + ") Tj 0 -20 Td (Verified by GlobalCo Automated Verification System) Tj ET\n" +
                "endstream endobj\n" +
                "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n" +
                "xref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000243 00000 n \n0000000414 00000 n \n" +
                "trailer << /Size 6 /Root 1 0 R >>\nstartxref\n493\n%%EOF\n";
        return pdf.getBytes(StandardCharsets.ISO_8859_1);
    }
}
