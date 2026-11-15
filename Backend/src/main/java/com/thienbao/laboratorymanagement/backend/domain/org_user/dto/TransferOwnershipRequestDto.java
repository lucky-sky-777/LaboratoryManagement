package com.thienbao.laboratorymanagement.backend.domain.org_user.dto;

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
public class TransferOwnershipRequestDto {

	@JsonProperty(value = "new_owner_user_id")
	Long newOwnerUserId;

}
