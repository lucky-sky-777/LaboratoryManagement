package com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.thienbao.laboratorymanagement.backend.common.annotation.DTO;
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
public class RejectJoinRequestDto {

	@JsonProperty(value = "reject_reason")
	String rejectReason;

}
