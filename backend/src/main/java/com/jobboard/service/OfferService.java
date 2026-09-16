package com.jobboard.service;

import com.jobboard.dto.OfferRequestDto;
import com.jobboard.entity.Application;
import com.jobboard.entity.Offer;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.OfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public OfferService(OfferRepository offerRepository,
                        ApplicationRepository applicationRepository,
                        NotificationService notificationService) {
        this.offerRepository = offerRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Offer createOffer(OfferRequestDto dto) {
        return createOffer(dto, null);
    }

    @Transactional
    public Offer createOffer(OfferRequestDto dto, com.jobboard.entity.User recruiter) {
        Application app = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found: " + dto.getApplicationId()));

        if (recruiter != null) {
            boolean isAuthorized = recruiter.getRoles() != null && recruiter.getRoles().stream().anyMatch(
                    r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_RECRUITER".equals(r.getName())
            );
            if (!isAuthorized && app.getJob() != null && app.getJob().getRecruiter() != null
                    && !app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
                throw new RuntimeException("Unauthorized: Only recruiters or admins can create offers");
            }
        }

        Offer offer = offerRepository.findByApplication_Id(dto.getApplicationId()).orElseGet(Offer::new);
        offer.setApplication(app);
        offer.setSalaryOffered(dto.getSalaryOffered());
        offer.setJoiningDate(dto.getJoiningDate());
        offer.setDetails(dto.getDetails());
        offer.setStatus("PENDING");
        offer.setCreatedAt(Instant.now());

        Offer saved = offerRepository.save(offer);

        app.setStatus(Application.ApplicationStatus.OFFER_SENT);
        applicationRepository.save(app);

        if (app.getCandidate() != null) {
            notificationService.createNotification(
                    app.getCandidate().getId(),
                    "Congratulations! An official job offer has been issued for " + app.getJob().getTitle()
            );
        }

        return saved;
    }

    public Optional<Offer> getOfferByApplicationId(Long applicationId) {
        return offerRepository.findByApplication_Id(applicationId);
    }

    @Transactional
    public Offer respondToOffer(Long offerId, String status, Long candidateId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found: " + offerId));

        Application app = offer.getApplication();
        if (candidateId != null && app != null && app.getCandidate() != null && !app.getCandidate().getId().equals(candidateId)) {
            throw new RuntimeException("Unauthorized: You can only respond to your own offers");
        }

        String upper = status.toUpperCase().trim();
        if ("ACCEPTED".equals(upper)) {
            offer.setStatus("ACCEPTED");
            if (app != null) {
                app.setStatus(Application.ApplicationStatus.OFFER_ACCEPTED);
                applicationRepository.save(app);
                if (app.getJob() != null && app.getJob().getRecruiter() != null) {
                    notificationService.createNotification(
                            app.getJob().getRecruiter().getId(),
                            app.getCandidate().getUsername() + " has ACCEPTED the offer for " + app.getJob().getTitle()
                    );
                }
            }
        } else if ("REJECTED".equals(upper) || "DECLINED".equals(upper)) {
            offer.setStatus("REJECTED");
            if (app != null) {
                app.setStatus(Application.ApplicationStatus.REJECTED);
                applicationRepository.save(app);
                if (app.getJob() != null && app.getJob().getRecruiter() != null) {
                    notificationService.createNotification(
                            app.getJob().getRecruiter().getId(),
                            app.getCandidate().getUsername() + " has declined the offer for " + app.getJob().getTitle()
                    );
                }
            }
        } else {
            throw new RuntimeException("Invalid offer response: " + status);
        }

        return offerRepository.save(offer);
    }
}
