package com.thienbao.laboratorymanagement.backend.domain.auth.internal.service;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.EmailVerification;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository.EmailVerificationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class EmailVerificationService {

	private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);
	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
	private static final SecureRandom RANDOM = new SecureRandom();

	EmailVerificationRepository emailVerificationRepository;
	UserService userService;
	EmailSenderService emailSenderService;

	@Transactional
	public String sendVerificationCode(Long userId, String targetEmail) {
		User user = userService.findByIdOrThrow(userId);

		if (user.getProvider() != null && user.getProvider() != User.Provider.INTERNAL) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Tài khoản liên kết mạng xã hội không thể thay đổi hoặc gửi mã xác thực email");
		}

		String email = (targetEmail != null && !targetEmail.trim().isEmpty())
				? targetEmail.trim()
				: user.getEmail();

		if (email == null || email.trim().isEmpty()) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Vui lòng cung cấp địa chỉ email để xác thực");
		}

		if (!EMAIL_PATTERN.matcher(email).matches()) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Định dạng email không hợp lệ");
		}

		String code = String.format("%06d", RANDOM.nextInt(1_000_000));
		Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

		EmailVerification verification = EmailVerification.builder()
				.userId(userId)
				.email(email)
				.code(code)
				.expiresAt(expiresAt)
				.verified(false)
				.createdAt(Instant.now())
				.build();

		emailVerificationRepository.save(verification);

		// Gửi email thực tế qua máy chủ SMTP
		emailSenderService.sendVerificationOtpEmail(email, code, user.getDisplayName());

		return code;
	}

	@Transactional
	public User verifyEmail(Long userId, String code) {
		if (code == null || code.trim().isEmpty()) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Mã xác thực không được để trống");
		}

		User user = userService.findByIdOrThrow(userId);
		if (user.getProvider() != null && user.getProvider() != User.Provider.INTERNAL) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Tài khoản liên kết mạng xã hội không thể thay đổi hoặc xác thực lại email");
		}

		EmailVerification verification = emailVerificationRepository
				.findTopByUserIdAndCodeAndVerifiedFalseOrderByCreatedAtDesc(userId, code.trim())
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.INVALID_REQUEST, "Mã xác thực không hợp lệ hoặc đã hết hạn")
				);

		if (verification.getExpiresAt().isBefore(Instant.now())) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Mã xác thực đã hết hạn, vui lòng yêu cầu mã mới");
		}

		verification.setVerified(true);
		emailVerificationRepository.save(verification);

		user.setEmail(verification.getEmail());
		user.setEmailVerified(true);

		return userService.save(user);
	}

}
