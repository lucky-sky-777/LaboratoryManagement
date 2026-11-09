package com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
		name = "users"
)
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@Enumerated(value = EnumType.STRING)
	@Column(name = "provider", nullable = false)
	Provider provider;

	public enum Provider {
		GOOGLE,
		MEZON,
		INTERNAL
	}

	@Column(name = "provider_id", nullable = true, unique = true)
	String providerId;

	@Column(name = "username", nullable = false, unique = true)
	String username;

	@Column(name = "password_hash", nullable = true)
	String passwordHash;

	@Column(name = "display_name", nullable = true)
	String displayName;

	@Column(name = "avatar_url", nullable = true)
	String avatarUrl;

	@Column(name = "email", nullable = true)
	String email;

	@Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
	Instant joinedAt;

	@PrePersist
	public void prePersist() {
		if (provider == null) {
			provider = Provider.INTERNAL;
		}
	}

	@NullMarked
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of();
	}

	@Override
	public @Nullable String getPassword() {
		return this.passwordHash;
	}

	@Override
	public boolean isAccountNonExpired() {
		return UserDetails.super.isAccountNonExpired();
	}

	@Override
	public boolean isAccountNonLocked() {
		return UserDetails.super.isAccountNonLocked();
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return UserDetails.super.isCredentialsNonExpired();
	}

	@Override
	public boolean isEnabled() {
		return UserDetails.super.isEnabled();
	}

	public static User create(Long id) {
		return User.builder()
				.id(id)
				.build();
	}

}