package com.thienbao.laboratorymanagement.backend.domain.org_join_request.controller;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.ResponseDTO;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.JwtService;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.CreateJoinRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.JoinRequestResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.JoinResultResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.RejectJoinRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.entity.OrganizationJoinRequest;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.service.OrganizationJoinRequestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@PreAuthorize("@TokenSecurity.isValid()")
@RequestMapping("/api/organizations")
@RestController
public class OrganizationJoinRequestController {

	OrganizationJoinRequestService organizationJoinRequestService;
	AuthService authService;
	JwtService jwtService;

	private Long getCurrentUserId() {
		Authentication authentication = authService.getAuthentication();
		return jwtService.extractUserIdFromAuthentication(authentication);
	}

	@PostMapping("/join")
	public ResponseDTO<JoinResultResponseDto> submitJoinRequest(
			@RequestBody CreateJoinRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		JoinResultResponseDto response = organizationJoinRequestService.submitJoinRequest(request, currentUserId);

		return ResponseDTO.<JoinResultResponseDto>builder()
				.success(true)
				.message(response.getMessage())
				.data(response)
				.build();
	}

	@GetMapping("/{orgId}/join-requests")
	public ResponseDTO<List<JoinRequestResponseDto>> getOrganizationJoinRequests(
			@PathVariable(name = "orgId") Long orgId,
			@RequestParam(name = "status", required = false) OrganizationJoinRequest.Status status
	) {
		Long currentUserId = getCurrentUserId();
		List<JoinRequestResponseDto> requests = organizationJoinRequestService.getOrganizationJoinRequests(
				orgId,
				status,
				currentUserId
		);

		return ResponseDTO.<List<JoinRequestResponseDto>>builder()
				.success(true)
				.message("Get organization join requests successful")
				.data(requests)
				.build();
	}

	@GetMapping("/join-requests/my")
	public ResponseDTO<List<JoinRequestResponseDto>> getMyJoinRequests(
			@RequestParam(name = "status", required = false) OrganizationJoinRequest.Status status
	) {
		Long currentUserId = getCurrentUserId();
		List<JoinRequestResponseDto> requests = organizationJoinRequestService.getMyJoinRequests(status, currentUserId);

		return ResponseDTO.<List<JoinRequestResponseDto>>builder()
				.success(true)
				.message("Get my join requests successful")
				.data(requests)
				.build();
	}

	@PostMapping("/join-requests/{requestId}/approve")
	public ResponseDTO<JoinRequestResponseDto> approveJoinRequest(
			@PathVariable(name = "requestId") Long requestId
	) {
		Long currentUserId = getCurrentUserId();
		JoinRequestResponseDto response = organizationJoinRequestService.approveJoinRequest(requestId, currentUserId);

		return ResponseDTO.<JoinRequestResponseDto>builder()
				.success(true)
				.message("Approve join request successful")
				.data(response)
				.build();
	}

	@PostMapping("/join-requests/{requestId}/reject")
	public ResponseDTO<JoinRequestResponseDto> rejectJoinRequest(
			@PathVariable(name = "requestId") Long requestId,
			@RequestBody(required = false) RejectJoinRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		JoinRequestResponseDto response = organizationJoinRequestService.rejectJoinRequest(
				requestId,
				request,
				currentUserId
		);

		return ResponseDTO.<JoinRequestResponseDto>builder()
				.success(true)
				.message("Reject join request successful")
				.data(response)
				.build();
	}

	@PostMapping("/join-requests/{requestId}/cancel")
	public ResponseDTO<JoinRequestResponseDto> cancelJoinRequest(
			@PathVariable(name = "requestId") Long requestId
	) {
		Long currentUserId = getCurrentUserId();
		JoinRequestResponseDto response = organizationJoinRequestService.cancelJoinRequest(requestId, currentUserId);

		return ResponseDTO.<JoinRequestResponseDto>builder()
				.success(true)
				.message("Cancel join request successful")
				.data(response)
				.build();
	}

}
