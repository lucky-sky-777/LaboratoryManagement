package com.thienbao.laboratorymanagement.backend.domain.org_user.controller;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.ResponseDTO;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.JwtService;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.AddMemberRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.OrganizationUserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.TransferOwnershipRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.UpdateMemberRoleRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.service.OrganizationUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@PreAuthorize("@TokenSecurity.isValid()")
@RequestMapping("/api/organizations")
@RestController
public class OrganizationUserController {

	OrganizationUserService organizationUserService;
	AuthService authService;
	JwtService jwtService;

	private Long getCurrentUserId() {
		Authentication authentication = authService.getAuthentication();
		return jwtService.extractUserIdFromAuthentication(authentication);
	}

	@GetMapping("/{orgId}/members")
	public ResponseDTO<List<OrganizationUserResponseDto>> getOrganizationMembers(
			@PathVariable(name = "orgId") Long orgId
	) {
		Long currentUserId = getCurrentUserId();
		List<OrganizationUserResponseDto> members = organizationUserService.getOrganizationMembers(orgId, currentUserId);

		return ResponseDTO.<List<OrganizationUserResponseDto>>builder()
				.success(true)
				.message("Get organization members successful")
				.data(members)
				.build();
	}

	@GetMapping("/joined")
	public ResponseDTO<List<OrganizationUserResponseDto>> getMyJoinedOrganizations() {
		Long currentUserId = getCurrentUserId();
		List<OrganizationUserResponseDto> myOrgs = organizationUserService.getMyOrganizations(currentUserId);

		return ResponseDTO.<List<OrganizationUserResponseDto>>builder()
				.success(true)
				.message("Get my joined organizations successful")
				.data(myOrgs)
				.build();
	}

	@PostMapping("/{orgId}/members")
	public ResponseDTO<OrganizationUserResponseDto> addMember(
			@PathVariable(name = "orgId") Long orgId,
			@RequestBody AddMemberRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		OrganizationUserResponseDto response = organizationUserService.addMember(orgId, request, currentUserId);

		return ResponseDTO.<OrganizationUserResponseDto>builder()
				.success(true)
				.message("Add member successful")
				.data(response)
				.build();
	}

	@PatchMapping("/{orgId}/members/{userId}/role")
	public ResponseDTO<OrganizationUserResponseDto> updateMemberRole(
			@PathVariable(name = "orgId") Long orgId,
			@PathVariable(name = "userId") Long targetUserId,
			@RequestBody UpdateMemberRoleRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		OrganizationUserResponseDto response = organizationUserService.updateMemberRole(
				orgId,
				targetUserId,
				request.getRole(),
				currentUserId
		);

		return ResponseDTO.<OrganizationUserResponseDto>builder()
				.success(true)
				.message("Update member role successful")
				.data(response)
				.build();
	}

	@DeleteMapping("/{orgId}/members/{userId}")
	public ResponseDTO<Void> removeMember(
			@PathVariable(name = "orgId") Long orgId,
			@PathVariable(name = "userId") Long targetUserId
	) {
		Long currentUserId = getCurrentUserId();
		organizationUserService.removeMember(orgId, targetUserId, currentUserId);

		return ResponseDTO.<Void>builder()
				.success(true)
				.message("Remove member successful")
				.build();
	}

	@PostMapping("/{orgId}/leave")
	public ResponseDTO<Void> leaveOrganization(
			@PathVariable(name = "orgId") Long orgId
	) {
		Long currentUserId = getCurrentUserId();
		organizationUserService.leaveOrganization(orgId, currentUserId);

		return ResponseDTO.<Void>builder()
				.success(true)
				.message("Leave organization successful")
				.build();
	}

	@PostMapping("/{orgId}/transfer-ownership")
	public ResponseDTO<OrganizationUserResponseDto> transferOwnership(
			@PathVariable(name = "orgId") Long orgId,
			@RequestBody TransferOwnershipRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		OrganizationUserResponseDto response = organizationUserService.transferOwnership(
				orgId,
				request.getNewOwnerUserId(),
				currentUserId
		);

		return ResponseDTO.<OrganizationUserResponseDto>builder()
				.success(true)
				.message("Transfer ownership successful")
				.data(response)
				.build();
	}

}
