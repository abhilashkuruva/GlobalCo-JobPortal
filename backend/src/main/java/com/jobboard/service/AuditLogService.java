package com.jobboard.service;

import com.jobboard.entity.AuditLog;
import com.jobboard.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logEvent(String eventType, Long userId, String details) {
        AuditLog log = new AuditLog();
        log.setEventType(eventType);
        log.setUserId(userId);
        log.setDetails(details);
        log.setTimestamp(Instant.now());
        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findAll();
    }
}
