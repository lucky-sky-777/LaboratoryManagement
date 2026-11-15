package com.thienbao.laboratorymanagement.backend.domain.org.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DTO
public class UpdateOrganizationRequestDto {

	@JsonProperty(value = "name")
	String name;

	@JsonProperty(value = "description")
	String description;

	@JsonProperty(value = "privacy")
	Organization.Privacy privacy;

}
