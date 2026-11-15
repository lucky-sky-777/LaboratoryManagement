package com.thienbao.laboratorymanagement.backend.domain.auth.internal.service;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SignUpRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.UpdateProfileRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.mapper.UserMapper;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.regex.Pattern;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class UserService {

	/**
	 * Repository
	 */

	UserRepository userRepository;

	/**
	 * Mapper
	 */

	UserMapper userMapper;

	/**
	 * Bean
	 */

	PasswordEncoder passwordEncoder;

	@Transactional
	public User createUser(SignUpRequestDto request) {
		throwIfExistsByUsername(request.getUsername());

		User user = userMapper.toUser(request);
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		if (user.getProvider() == null) {
			user.setProvider(User.Provider.INTERNAL);
		}
		if (user.getProvider() != User.Provider.INTERNAL) {
			user.setEmailVerified(true);
		}

		return save(user);
	}

	private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

	@Transactional
	public User updateProfile(Long userId, UpdateProfileRequestDto request) {
		User user = findByIdOrThrow(userId);

		if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
			user.setDisplayName(request.getDisplayName().trim());
		}

		if (request.getEmail() != null) {
			String newEmail = request.getEmail().trim();
			if (!Objects.equals(user.getEmail(), newEmail)) {
				if (user.getProvider() != null && user.getProvider() != User.Provider.INTERNAL) {
					throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Tài khoản liên kết mạng xã hội không thể thay đổi địa chỉ email");
				}
				if (!newEmail.isEmpty() && !EMAIL_PATTERN.matcher(newEmail).matches()) {
					throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Định dạng email không hợp lệ");
				}
				user.setEmail(newEmail.isEmpty() ? null : newEmail);
				user.setEmailVerified(false);
			}
		}

		return save(user);
	}

	@Transactional
	public void updatePassword(String username, String newPassword) {
		User user = findByUsernameOrThrow(username);

		user.setPasswordHash(passwordEncoder.encode(newPassword));

		save(user);
	}

	@Transactional
	public User save(User user) {
		return userRepository.save(user);
	}

	@Transactional
	public void delete(User user) {
		userRepository.delete(user);
	}

	@Transactional(readOnly = true)
	public User findByUserIdOrThrow(Long userId) {
		return userRepository
				.findById(userId)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User not found")
				);
	}

	@Transactional
	public User findByUsernameOrThrow(String username) {
		return userRepository
				.findByUsername(username)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User not found")
				);
	}

	@Transactional(readOnly = true)
	public User findByIdOrThrow(Long userId) {
		return userRepository
				.findById(userId)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User not found")
				);
	}

	public boolean existsById(Long id) {
		return userRepository.existsById(id);
	}

	@Transactional
	public boolean existsByUsername(String username) {
		return userRepository.existsByUsername(username);
	}

	@Transactional
	public void throwIfExistsByUsername(String username) {
		if (existsByUsername(username)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User exists");
		}
	}

	@Transactional(readOnly = true)
	public User findByProviderIdOrThrow(String providerId) {
		return userRepository
				.findByProviderId(providerId)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User not found")
				);
	}

	@Transactional(readOnly = true)
	public boolean existsByProviderId(String providerId) {
		return userRepository.existsByProviderId(providerId);
	}

	@Transactional
	public void throwIfNotExistsByUsername(String username) {
		if (!existsByUsername(username)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
		}
	}

	public void throwIfExistsById(Long id) {
		if (existsById(id)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User exists");
		}
	}

	public void throwIfNotExistsById(Long id) {
		if (!existsById(id)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "User not found");
		}
	}

}