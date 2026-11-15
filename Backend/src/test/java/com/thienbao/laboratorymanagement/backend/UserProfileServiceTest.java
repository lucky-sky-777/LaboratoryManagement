package com.thienbao.laboratorymanagement.backend;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.changepassword.ChangePasswordRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SignUpRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.UpdateProfileRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository.UserRepository;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.EmailVerificationService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@SpringBootTest
@Transactional
class UserProfileServiceTest {

	@Autowired
	UserService userService;

	@Autowired
	UserRepository userRepository;

	@Autowired
	EmailVerificationService emailVerificationService;

	@Autowired
	AuthService authService;

	@MockitoBean
	com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.EmailSenderService emailSenderService;

	private User createTestUser() {
		String suffix = UUID.randomUUID().toString().substring(0, 8);
		SignUpRequestDto request = SignUpRequestDto.builder()
				.username("testuser_" + suffix)
				.password("Password123!")
				.displayName("Nguyễn Văn Test")
				.email("testuser_" + suffix + "@example.com")
				.build();
		return userService.createUser(request);
	}

	@Test
	void testUpdateProfileDisplayNameAndEmail() {
		User user = createTestUser();

		UpdateProfileRequestDto updateRequest = UpdateProfileRequestDto.builder()
				.displayName("Tên Mới Được Cập Nhật")
				.email("newemail_" + UUID.randomUUID().toString().substring(0, 6) + "@domain.com")
				.build();

		User updated = userService.updateProfile(user.getId(), updateRequest);

		Assertions.assertEquals("Tên Mới Được Cập Nhật", updated.getDisplayName());
		Assertions.assertEquals(updateRequest.getEmail(), updated.getEmail());
		Assertions.assertFalse(updated.getEmailVerified());
	}

	@Test
	void testSendAndVerifyEmailCode() {
		User user = createTestUser();
		String targetEmail = "verify_" + UUID.randomUUID().toString().substring(0, 6) + "@testdomain.com";

		String code = emailVerificationService.sendVerificationCode(user.getId(), targetEmail);
		Assertions.assertNotNull(code);
		Assertions.assertEquals(6, code.length());

		User verifiedUser = emailVerificationService.verifyEmail(user.getId(), code);
		Assertions.assertTrue(verifiedUser.getEmailVerified());
		Assertions.assertEquals(targetEmail, verifiedUser.getEmail());
	}

	@Test
	void testVerifyEmailWithInvalidCode() {
		User user = createTestUser();
		emailVerificationService.sendVerificationCode(user.getId(), user.getEmail());

		Assertions.assertThrows(GlobalException.class, () -> {
			emailVerificationService.verifyEmail(user.getId(), "000000_invalid");
		});
	}

	@Test
	void testChangePassword() {
		User user = createTestUser();

		// Update password
		userService.updatePassword(user.getUsername(), "NewPassword123!");

		User refreshed = userService.findByUsernameOrThrow(user.getUsername());
		Assertions.assertNotNull(refreshed.getPasswordHash());
	}

	private User createOAuthTestUser(User.Provider provider) {
		String suffix = UUID.randomUUID().toString().substring(0, 8);
		SignUpRequestDto request = SignUpRequestDto.builder()
				.provider(provider)
				.providerId("oauth_id_" + suffix)
				.username("oauth_user_" + suffix)
				.displayName("Google User " + suffix)
				.email("oauth_" + suffix + "@gmail.com")
				.build();
		return userService.createUser(request);
	}

	@Test
	void testOAuthUserCannotChangeEmail() {
		User oauthUser = createOAuthTestUser(User.Provider.GOOGLE);
		Assertions.assertEquals(User.Provider.GOOGLE, oauthUser.getProvider());
		Assertions.assertTrue(oauthUser.getEmailVerified());

		UpdateProfileRequestDto changeEmailRequest = UpdateProfileRequestDto.builder()
				.email("different_email@gmail.com")
				.build();

		Assertions.assertThrows(GlobalException.class, () -> {
			userService.updateProfile(oauthUser.getId(), changeEmailRequest);
		});
	}

	@Test
	void testOAuthUserCanChangeDisplayNameWithoutChangingEmail() {
		User oauthUser = createOAuthTestUser(User.Provider.GOOGLE);
		String originalEmail = oauthUser.getEmail();

		UpdateProfileRequestDto updateNameRequest = UpdateProfileRequestDto.builder()
				.displayName("New Google Name")
				.email(originalEmail)
				.build();

		User updated = userService.updateProfile(oauthUser.getId(), updateNameRequest);
		Assertions.assertEquals("New Google Name", updated.getDisplayName());
		Assertions.assertEquals(originalEmail, updated.getEmail());
		Assertions.assertTrue(updated.getEmailVerified());
	}

	@Test
	void testOAuthUserCannotSendOrVerifyEmailCode() {
		User oauthUser = createOAuthTestUser(User.Provider.GOOGLE);

		Assertions.assertThrows(GlobalException.class, () -> {
			emailVerificationService.sendVerificationCode(oauthUser.getId(), "another@gmail.com");
		});

		Assertions.assertThrows(GlobalException.class, () -> {
			emailVerificationService.verifyEmail(oauthUser.getId(), "123456");
		});
	}

}
