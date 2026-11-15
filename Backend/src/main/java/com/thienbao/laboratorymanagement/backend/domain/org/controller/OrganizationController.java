package com.thienbao.laboratorymanagement.backend.domain.org.controller;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.ResponseDTO;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.JwtService;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.CreateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.UpdateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.response.OrganizationResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org.service.OrganizationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/organizations")
@RestController
public class OrganizationController {

	OrganizationService organizationService;
	AuthService authService;
	JwtService jwtService;

	private Long getCurrentUserId() {
		Authentication authentication = authService.getAuthentication();
		return jwtService.extractUserIdFromAuthentication(authentication);
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PostMapping
	public ResponseDTO<OrganizationResponseDto> create(
			@RequestBody CreateOrganizationRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		OrganizationResponseDto response = organizationService.createOrganization(request, currentUserId);

		return ResponseDTO.ok("Create organization successful", response);
	}

	@GetMapping("/{id}")
	public ResponseDTO<OrganizationResponseDto> getById(
			@PathVariable Long id
	) {
		OrganizationResponseDto response = organizationService.getById(id);

		return ResponseDTO.ok("Get organization successful", response);
	}

	@GetMapping("/code/{code}")
	public ResponseDTO<OrganizationResponseDto> getByCode(
			@PathVariable String code
	) {
		OrganizationResponseDto response = organizationService.getByCode(code);

		return ResponseDTO.ok("Get organization by code successful", response);
	}

	@GetMapping
	public ResponseDTO<Page<OrganizationResponseDto>> getAll(
			@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		Page<OrganizationResponseDto> response = organizationService.getAll(pageable);

		return ResponseDTO.ok("Get organizations successful", response);
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@GetMapping("/my")
	public ResponseDTO<Page<OrganizationResponseDto>> getMyOrganizations(
			@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		Long currentUserId = getCurrentUserId();
		Page<OrganizationResponseDto> response = organizationService.getByCreatorId(currentUserId, pageable);

		return ResponseDTO.ok("Get my organizations successful", response);
	}

	@GetMapping("/public")
	public ResponseDTO<Page<OrganizationResponseDto>> getPublicOrganizations(
			@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
	) {
		Page<OrganizationResponseDto> response = organizationService.getPublicOrganizations(pageable);

		return ResponseDTO.ok("Get public organizations successful", response);
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@PutMapping("/{id}")
	public ResponseDTO<OrganizationResponseDto> update(
			@PathVariable Long id,
			@RequestBody UpdateOrganizationRequestDto request
	) {
		Long currentUserId = getCurrentUserId();
		OrganizationResponseDto response = organizationService.updateOrganization(id, request, currentUserId);

		return ResponseDTO.ok("Update organization successful", response);
	}

	@PreAuthorize("@TokenSecurity.isValid()")
	@DeleteMapping("/{id}")
	public ResponseDTO<Void> delete(
			@PathVariable Long id
	) {
		Long currentUserId = getCurrentUserId();
		organizationService.deleteById(id, currentUserId);

		return ResponseDTO.ok("Delete organization successful");
	}

}
