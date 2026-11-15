package com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.entity.OrganizationJoinRequest;
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
		"message",
		"creator_user_id",
		"creator_username",
		"creator_display_name",
		"creator_avatar_url",
		"creator_email",
		"status",
		"actor_user_id",
		"actor_username",
		"actor_display_name",
		"acted_at",
		"reject_reason",
		"created_at"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public class JoinRequestResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "organization_id")
	Long organizationId;

	@JsonProperty(value = "organization_name")
	String organizationName;

	@JsonProperty(value = "organization_code")
	String organizationCode;

	@JsonProperty(value = "message")
	String message;

	@JsonProperty(value = "creator_user_id")
	Long creatorUserId;

	@JsonProperty(value = "creator_username")
	String creatorUsername;

	@JsonProperty(value = "creator_display_name")
	String creatorDisplayName;

	@JsonProperty(value = "creator_avatar_url")
	String creatorAvatarUrl;

	@JsonProperty(value = "creator_email")
	String creatorEmail;

	@JsonProperty(value = "status")
	OrganizationJoinRequest.Status status;

	@JsonProperty(value = "actor_user_id")
	Long actorUserId;

	@JsonProperty(value = "actor_username")
	String actorUsername;

	@JsonProperty(value = "actor_display_name")
	String actorDisplayName;

	@JsonProperty(value = "acted_at")
	Instant actedAt;

	@JsonProperty(value = "reject_reason")
	String rejectReason;

	@JsonProperty(value = "created_at")
	Instant createdAt;

}
