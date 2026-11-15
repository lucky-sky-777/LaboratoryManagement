package com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

	Optional<EmailVerification> findTopByUserIdAndVerifiedFalseOrderByCreatedAtDesc(Long userId);

	Optional<EmailVerification> findTopByUserIdAndCodeAndVerifiedFalseOrderByCreatedAtDesc(Long userId, String code);

	Optional<EmailVerification> findTopByUserIdAndEmailAndVerifiedFalseOrderByCreatedAtDesc(Long userId, String email);

}
