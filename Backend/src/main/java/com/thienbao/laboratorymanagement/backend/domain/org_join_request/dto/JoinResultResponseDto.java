package com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.OrganizationUserResponseDto;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@JsonPropertyOrder(value = {
		"status",
		"message",
		"organization_user",
		"join_request"
})
@JsonInclude(value = JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public class JoinResultResponseDto {

	@JsonProperty(value = "status")
	String status; // "JOINED" | "PENDING"

	@JsonProperty(value = "message")
	String message;

	@JsonProperty(value = "organization_user")
	OrganizationUserResponseDto organizationUser;

	@JsonProperty(value = "join_request")
	JoinRequestResponseDto joinRequest;

}
