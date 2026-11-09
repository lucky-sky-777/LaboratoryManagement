package com.thienbao.laboratorymanagement.backend.domain.org_user.entity;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
		name = "organization_users",
		uniqueConstraints = @UniqueConstraint(
				columnNames = {"organization_id", "user_id"}
		),
		indexes = {
				@Index(
						name = "index_organization_users_organization_id_user_id",
						columnList = "organization_id, user_id"
				)
		}
)
public class OrganizationUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organization_id", nullable = false)
	Organization organization;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false)
	Role role;

	public enum Role {
		OWNER,
		ORGANIZATION_MANAGER,
		LABORATORY_MANAGER,
		MEMBER
	}

	@Column(name = "joined_at", nullable = false, insertable = false, updatable = false)
	Instant joinedAt;

	@PrePersist
	public void prePersist() {
		if (role == null) {
			role = Role.MEMBER;
		}
	}

}