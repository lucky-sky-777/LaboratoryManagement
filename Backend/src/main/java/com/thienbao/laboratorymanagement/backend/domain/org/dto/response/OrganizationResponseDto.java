package com.thienbao.laboratorymanagement.backend.domain.org.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.common.constant.DateTimeConstant;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.response.UserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
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
		"name",
		"description",
		"code",
		"privacy",
		"creator_id",
		"creator",
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
public class OrganizationResponseDto {

	@JsonProperty(value = "id")
	Long id;

	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "code")
	String code;

	@JsonProperty(value = "privacy")
	Organization.Privacy privacy;

	@JsonProperty(value = "creator_id")
	Long creatorId;

	@JsonProperty(value = "creator")
	UserResponseDto creator;

	@JsonFormat(pattern = DateTimeConstant.PATTERN_FULL_DATETIME, timezone = DateTimeConstant.TIMEZONE)
	@JsonProperty(value = "created_at")
	Instant createdAt;

}
