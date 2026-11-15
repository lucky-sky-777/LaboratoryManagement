package com.thienbao.laboratorymanagement.backend.domain.auth.internal.controller;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.ResponseDTO;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.changepassword.ChangePasswordRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SendVerificationCodeRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SignUpRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SignUpResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.UpdateProfileRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.VerifyEmailRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.response.UserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.signin.SignInRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.signin.SignInResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.signout.SignOutResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.mapper.UserMapper;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.EmailVerificationService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.JwtService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@RestController
public class AuthController {

	AuthService authService;
	UserService userService;
	JwtService jwtService;
	UserMapper userMapper;
	EmailVerificationService emailVerificationService;

	@PostMapping("/signin")
	public ResponseDTO<SignInResponseDto> signIn(
			@RequestBody SignInRequestDto request
	) {
		SignInResponseDto signInResponseDto = authService.signInInternal(request);

		return ResponseDTO.<SignInResponseDto>builder()
				.success(true)
				.message("Sign in successful")
				.data(signInResponseDto)
				.build();
	}

	@PostMapping("/signup")
	public ResponseDTO<SignUpResponseDto> signUp(
			@RequestBody SignUpRequestDto request
	) {
		SignUpResponseDto signUpResponseDto = authService.signUpInternal(request);

		return ResponseDTO.<SignUpResponseDto>builder()
				.success(true)
				.message("Sign up successful")
				.data(signUpResponseDto)
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping("/signout")
	public ResponseDTO<SignOutResponseDto> signOut(
			@RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken
	) {
		System.out.println(refreshToken);
		Authentication authentication = authService.getAuthentication();
		SignOutResponseDto signOutResponseDto = authService.signOut(authentication, refreshToken);

		return ResponseDTO.<SignOutResponseDto>builder()
				.success(true)
				.message("Sign out successful")
				.data(signOutResponseDto)
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@GetMapping("/user")
	public ResponseDTO<UserResponseDto> current() {
		Authentication authentication = authService.getAuthentication();
		UserResponseDto response = authService.getCurrentUser(authentication);

		return ResponseDTO.<UserResponseDto>builder()
				.success(true)
				.message("Get current user successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping("/validate")
	public ResponseDTO<Void> validateAuthState() {
		return ResponseDTO.<Void>builder()
				.success(true)
				.message("Valid auth state")
				.build();
	}

	@PostMapping("/refresh")
	public ResponseDTO<SignInResponseDto> refresh(
			@RequestHeader(name = "X-Refresh-Token") String refreshToken
	) {
		SignInResponseDto response = authService.refresh(refreshToken);

		return ResponseDTO.<SignInResponseDto>builder()
				.success(true)
				.message("Refresh tokens successful")
				.data(response)
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PutMapping("/profile")
	public ResponseDTO<UserResponseDto> updateProfile(
			@RequestBody UpdateProfileRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserIdFromAuthentication(authentication);
		User updatedUser = userService.updateProfile(userId, request);
		UserResponseDto response = userMapper.toUserResponseDto(updatedUser);

		return ResponseDTO.<UserResponseDto>builder()
				.success(true)
				.message("Cập nhật thông tin thành công")
				.data(response)
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping("/change-password")
	public ResponseDTO<Void> changePassword(
			@RequestBody ChangePasswordRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		authService.changePassword(authentication, request);

		return ResponseDTO.<Void>builder()
				.success(true)
				.message("Đổi mật khẩu thành công")
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping("/email/send-verification")
	public ResponseDTO<String> sendEmailVerification(
			@RequestBody(required = false) SendVerificationCodeRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserIdFromAuthentication(authentication);
		String targetEmail = request != null ? request.getEmail() : null;
		emailVerificationService.sendVerificationCode(userId, targetEmail);

		return ResponseDTO.<String>builder()
				.success(true)
				.message("Mã xác thực đã được gửi tới email của bạn")
				.build();
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping("/email/verify")
	public ResponseDTO<UserResponseDto> verifyEmail(
			@RequestBody VerifyEmailRequestDto request
	) {
		Authentication authentication = authService.getAuthentication();
		Long userId = jwtService.extractUserIdFromAuthentication(authentication);
		User verifiedUser = emailVerificationService.verifyEmail(userId, request.getCode());
		UserResponseDto response = userMapper.toUserResponseDto(verifiedUser);

		return ResponseDTO.<UserResponseDto>builder()
				.success(true)
				.message("Xác thực email thành công")
				.data(response)
				.build();
	}

}