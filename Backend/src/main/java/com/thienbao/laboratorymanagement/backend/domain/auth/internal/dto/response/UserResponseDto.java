package com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
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
		"username",
		"email",
		"email_verified",
		"display_name",
		"avatar_url",
		"provider",
		"provider_id",
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
public class UserResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "username")
	String username;

	@JsonProperty(value = "email")
	String email;

	@JsonProperty(value = "email_verified")
	Boolean emailVerified;

	@JsonProperty(value = "display_name")
	String displayName;

	@JsonProperty(value = "avatar_url")
	String avatarUrl;

	@JsonProperty(value = "provider")
	User.Provider provider;

	@JsonProperty(value = "provider_id")
	String providerId;

	@JsonProperty(value = "joined_at")
	Instant joinedAt;

}
