package com.thienbao.laboratorymanagement.backend.domain.org.entity;

import com.thienbao.laboratorymanagement.backend.common.util.CodeGenerator;
import com.thienbao.laboratorymanagement.backend.common.util.DateTimeUtils;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(
		name = "organizations"
)
public class Organization {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@Column(name = "name", nullable = false)
	String name;

	@Column(name = "description", nullable = true)
	String description;

	@Column(name = "code", nullable = false, unique = true)
	String code;

	@Enumerated(EnumType.STRING)
	@Column(name = "privacy", nullable = false)
	Privacy privacy;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_user_id", nullable = false)
	User creator;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	Instant createdAt;

	public enum Privacy {
		PUBLIC,
		PRIVATE
	}

	@PrePersist
	public void prePersist() {
		if (name == null) {
			name = "Class_" + DateTimeUtils.currentTimestamp();
		}
		if (code == null) {
			code = CodeGenerator.generate(7);
		}
		if (privacy == null) {
			privacy = Privacy.PRIVATE;
		}
	}

	public static Organization create(Long id) {
		return Organization.builder()
				.id(id)
				.build();
	}

}