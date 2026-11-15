package com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "email_verifications")
public class EmailVerification {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@Column(name = "user_id", nullable = false)
	Long userId;

	@Column(name = "email", nullable = false)
	String email;

	@Column(name = "code", nullable = false, length = 10)
	String code;

	@Column(name = "expires_at", nullable = false)
	Instant expiresAt;

	@Column(name = "verified", nullable = false)
	@Builder.Default
	Boolean verified = false;

	@Column(name = "created_at", nullable = false)
	Instant createdAt;

	@PrePersist
	public void prePersist() {
		if (verified == null) {
			verified = false;
		}
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}

}
