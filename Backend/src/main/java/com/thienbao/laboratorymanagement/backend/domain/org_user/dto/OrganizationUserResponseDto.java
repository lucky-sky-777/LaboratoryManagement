package com.thienbao.laboratorymanagement.backend.domain.org_user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@JsonPropertyOrder(value = {
		"id",
		"organization_id",
		"organization_name",
		"organization_code",
		"user_id",
		"username",
		"display_name",
		"avatar_url",
		"email",
		"role",
		"joined_at"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public class OrganizationUserResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "organization_id")
	Long organizationId;

	@JsonProperty(value = "organization_name")
	String organizationName;

	@JsonProperty(value = "organization_code")
	String organizationCode;

	@JsonProperty(value = "user_id")
	Long userId;

	@JsonProperty(value = "username")
	String username;

	@JsonProperty(value = "display_name")
	String displayName;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "email")
	String email;

	@JsonProperty(value = "role")
	OrganizationUser.Role role;

	@JsonProperty(value = "joined_at")
	Instant joinedAt;

}
