package com.jobboard.service;

import com.jobboard.entity.Application;
import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.Job;
import com.jobboard.entity.Skill;
import com.jobboard.entity.User;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.CandidateProfileRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.NoSuchElementException;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              CandidateProfileRepository candidateProfileRepository,
                              NotificationService notificationService,
                              FileStorageService fileStorageService) {
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    public Page<Application> getApplicationsByCandidate(Long candidateId, Pageable pageable) {
        return applicationRepository.findByCandidate_Id(candidateId, pageable);
    }

    public List<Application> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidate_Id(candidateId);
    }

    public List<Application> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJob_Id(jobId);
    }

    public Page<Application> getApplicationsByJob(Long jobId, Pageable pageable) {
        return applicationRepository.findByJob_Id(jobId, pageable);
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
    }

    @Transactional
    public Application updateApplicationStatus(Long id, String status) {
        Application application = getApplicationById(id);
        try {
            String normalized = status.toUpperCase().trim();
            if ("REVIEWING".equals(normalized) || "UNDER_REVIEW".equals(normalized) || "IN_REVIEW".equals(normalized)) {
                normalized = "SCREENING";
            }
            Application.ApplicationStatus newStatus = Application.ApplicationStatus.valueOf(normalized);
            application.setStatus(newStatus);

            if (application.getCandidate() != null) {
                notificationService.createNotification(
                        application.getCandidate().getId(),
                        "Your application for " + application.getJob().getTitle() + " has been updated to: " + newStatus.name().replace('_', ' ')
                );
            }

            return applicationRepository.save(application);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    @Transactional
    public void withdrawApplication(Long id, Long candidateId) {
        Application application = getApplicationById(id);
        if (candidateId != null && application.getCandidate() != null && !application.getCandidate().getId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized: You can only withdraw your own applications");
        }
        application.setStatus(Application.ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    @Transactional
    public Application updateRecruiterNotes(Long id, String notes, Long recruiterId) {
        Application application = getApplicationById(id);
        if (recruiterId != null) {
            verifyRecruiterAccess(application, recruiterId);
        }
        application.setRecruiterNotes(notes);
        return applicationRepository.save(application);
    }

    public void verifyRecruiterAccess(Application application, Long recruiterId) {
        if (application.getJob() == null || application.getJob().getRecruiter() == null) {
            return;
        }
        if (!application.getJob().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: Application belongs to another recruiter's job");
        }
    }

    public void verifyRecruiterAccess(Application application, String recruiterUsernameOrEmail) {
        if (application.getJob() == null || application.getJob().getRecruiter() == null) {
            return;
        }
        User recruiter = application.getJob().getRecruiter();
        if (!recruiter.getUsername().equals(recruiterUsernameOrEmail) && !recruiter.getEmail().equals(recruiterUsernameOrEmail)) {
            throw new RuntimeException("Unauthorized: Application belongs to another recruiter's job");
        }
    }

    /**
     * Returns the resume submitted with an application after confirming that the
     * requesting recruiter owns the job. Older applications can fall back to
     * the candidate's profile resume when they predate resume snapshots.
     */
    public Path getResumeForRecruiter(Long applicationId, Long recruiterId) {
        Application application = getApplicationById(applicationId);
        verifyRecruiterAccess(application, recruiterId);

        String resumeUrl = application.getResumeUrl();
        if ((resumeUrl == null || resumeUrl.isBlank()) && application.getCandidate() != null) {
            resumeUrl = candidateProfileRepository.findByUserId(application.getCandidate().getId())
                    .map(CandidateProfile::getResumeUrl)
                    .orElse(null);
        }
        if (resumeUrl == null || resumeUrl.isBlank()) {
            throw new NoSuchElementException("No resume has been submitted for this applicant");
        }

        String fileName = resumeUrl.substring(resumeUrl.lastIndexOf('/') + 1);
        Path resumePath = fileStorageService.resolveResume(fileName);
        if (!Files.isRegularFile(resumePath)) {
            throw new NoSuchElementException("The submitted resume file is unavailable");
        }
        return resumePath;
    }

    @Transactional
    public void bulkUpdateStatus(List<Long> ids, String status) {
        for (Long id : ids) {
            updateApplicationStatus(id, status);
        }
    }

    /**
     * Generates a professional Excel (.xlsx) file containing application details.
     */
    public byte[] exportApplicationsToExcel(Long jobId) {
        List<Application> apps = applicationRepository.findByJob_Id(jobId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Applications");

            // Header styling
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Data cell styling
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Headers
            String[] headers = {
                    "Job ID", "Job Title", "Company", "Location", "Job Type",
                    "Applicant ID", "Candidate Name", "Email", "Phone", "Location",
                    "Education", "Experience (Years)", "Skills",
                    "Application ID", "Applied Date", "Status", "Match Score (%)",
                    "Submitted Resume Filename"
            };

            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(24);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill rows
            int rowIdx = 1;
            for (Application app : apps) {
                Row row = sheet.createRow(rowIdx++);
                Job job = app.getJob();
                User cand = app.getCandidate();
                CandidateProfile profile = (cand != null) ? candidateProfileRepository.findByUserId(cand.getId()).orElse(null) : null;

                String fullName = cand != null
                        ? ((cand.getFirstName() != null ? cand.getFirstName() : "") + " " + (cand.getLastName() != null ? cand.getLastName() : "")).trim()
                        : "N/A";

                String skillsStr = "";
                if (profile != null && profile.getSkills() != null) {
                    skillsStr = profile.getSkills().stream().map(Skill::getName).collect(Collectors.joining(", "));
                }

                String resumeFile = app.getResumeFileName() != null
                        ? app.getResumeFileName()
                        : (profile != null && profile.getResumeFileName() != null ? profile.getResumeFileName() : "None");

                row.createCell(0).setCellValue(job != null ? job.getId() : 0);
                row.createCell(1).setCellValue(job != null ? job.getTitle() : "N/A");
                row.createCell(2).setCellValue(job != null && job.getCompany() != null ? job.getCompany().getName() : "N/A");
                row.createCell(3).setCellValue(job != null ? job.getLocation() : "N/A");
                row.createCell(4).setCellValue(job != null ? job.getJobType() : "N/A");

                row.createCell(5).setCellValue(cand != null ? cand.getId() : 0);
                row.createCell(6).setCellValue(fullName);
                row.createCell(7).setCellValue(cand != null && cand.getEmail() != null ? cand.getEmail() : "N/A");
                row.createCell(8).setCellValue(cand != null && cand.getMobileNumber() != null ? cand.getMobileNumber() : (profile != null ? profile.getPhone() : "N/A"));
                row.createCell(9).setCellValue(cand != null && cand.getLocation() != null ? cand.getLocation() : (profile != null ? profile.getLocation() : "N/A"));

                row.createCell(10).setCellValue(profile != null && profile.getEducation() != null ? profile.getEducation() : "N/A");
                row.createCell(11).setCellValue(profile != null && profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0);
                row.createCell(12).setCellValue(skillsStr);

                row.createCell(13).setCellValue(app.getId());
                row.createCell(14).setCellValue(app.getAppliedDate() != null ? app.getAppliedDate().toString() : "N/A");
                row.createCell(15).setCellValue(app.getStatus() != null ? app.getStatus() : "APPLIED");
                row.createCell(16).setCellValue(app.getMatchScore() != null ? app.getMatchScore().doubleValue() : 0.0);
                row.createCell(17).setCellValue(resumeFile);

                for (int c = 0; c < headers.length; c++) {
                    Cell cell = row.getCell(c);
                    if (cell != null) {
                        cell.setCellStyle(dataStyle);
                    }
                }
            }

            // Freeze top header row
            sheet.createFreezePane(0, 1);

            // Auto-filter
            if (rowIdx > 1) {
                sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, rowIdx - 1, 0, headers.length - 1));
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(currentWidth + 1000, 3500));
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel export: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a ZIP archive containing Applications.xlsx and a Resumes/ folder with candidate resumes.
     */
    public byte[] exportApplicationsToZip(Long jobId) {
        List<Application> apps = applicationRepository.findByJob_Id(jobId);
        byte[] excelBytes = exportApplicationsToExcel(jobId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            // 1. Add Excel file
            ZipEntry excelEntry = new ZipEntry("Applications.xlsx");
            zos.putNextEntry(excelEntry);
            zos.write(excelBytes);
            zos.closeEntry();

            // 2. Add Resumes
            int applicantIndex = 1;
            for (Application app : apps) {
                String resumeUrl = app.getResumeUrl();
                if (resumeUrl == null || resumeUrl.isBlank()) {
                    CandidateProfile prof = app.getCandidate() != null
                            ? candidateProfileRepository.findByUserId(app.getCandidate().getId()).orElse(null)
                            : null;
                    if (prof != null) {
                        resumeUrl = prof.getResumeUrl();
                    }
                }

                if (resumeUrl != null && resumeUrl.contains("/api/resumes/view/")) {
                    String actualFileName = resumeUrl.substring(resumeUrl.lastIndexOf("/") + 1);
                    Path resumePath = fileStorageService.resolveResume(actualFileName);

                    if (Files.exists(resumePath)) {
                        String candName = app.getCandidate() != null && app.getCandidate().getFirstName() != null
                                ? app.getCandidate().getFirstName().replaceAll("[^a-zA-Z0-9]", "_")
                                : "Candidate_" + applicantIndex;

                        String originalName = app.getResumeFileName() != null ? app.getResumeFileName() : actualFileName;
                        String zipEntryName = "Resumes/" + String.format("Candidate_%03d_%s_%s", applicantIndex, candName, originalName);

                        ZipEntry resumeEntry = new ZipEntry(zipEntryName);
                        zos.putNextEntry(resumeEntry);
                        Files.copy(resumePath, zos);
                        zos.closeEntry();
                    }
                }
                applicantIndex++;
            }

            zos.finish();
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to package applications zip: " + e.getMessage(), e);
        }
    }

    public byte[] exportApplicantsToCsv(Long jobId) {
        List<Application> apps = applicationRepository.findByJob_Id(jobId);
        StringBuilder sb = new StringBuilder();
        sb.append("Candidate Name,Email,Match Score,Status,Applied At\n");

        for (Application app : apps) {
            User cand = app.getCandidate();
            String fullName = cand != null 
                    ? ((cand.getFirstName() != null ? cand.getFirstName() : "") + " " + (cand.getLastName() != null ? cand.getLastName() : "")).trim()
                    : "Unknown";
            String email = (cand != null && cand.getEmail() != null) ? cand.getEmail() : "";
            
            sb.append("\"").append(fullName.replace("\"", "\"\"")).append("\",")
              .append("\"").append(email.replace("\"", "\"\"")).append("\",")
              .append(app.getMatchScore() != null ? app.getMatchScore() : "0.00").append(",")
              .append(app.getStatus()).append(",")
              .append(app.getAppliedDate()).append("\n");
        }
        return sb.toString().getBytes();
    }
}
