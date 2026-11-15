package com.thienbao.laboratorymanagement.backend.domain.org_join_request.service;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.UserService;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import com.thienbao.laboratorymanagement.backend.domain.org.service.OrganizationService;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.CreateJoinRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.JoinRequestResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.JoinResultResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.RejectJoinRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.entity.OrganizationJoinRequest;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.mapper.OrganizationJoinRequestMapper;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.repository.OrganizationJoinRequestRepository;
import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import com.thienbao.laboratorymanagement.backend.domain.org_user.mapper.OrganizationUserMapper;
import com.thienbao.laboratorymanagement.backend.domain.org_user.service.OrganizationUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class OrganizationJoinRequestService {

	OrganizationJoinRequestRepository organizationJoinRequestRepository;
	OrganizationService organizationService;
	OrganizationUserService organizationUserService;
	UserService userService;
	OrganizationJoinRequestMapper organizationJoinRequestMapper;
	OrganizationUserMapper organizationUserMapper;

	@Transactional
	public JoinResultResponseDto submitJoinRequest(CreateJoinRequestDto requestDto, Long currentUserId) {
		if (requestDto == null || requestDto.getCode() == null || requestDto.getCode().isBlank()) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Organization code must not be empty");
		}

		String normalizedCode = requestDto.getCode().trim().toUpperCase(Locale.ROOT);
		Organization organization = organizationService.findByCodeOrThrow(normalizedCode);
		User currentUser = userService.findByIdOrThrow(currentUserId);

		if (organizationUserService.isUserInOrganization(organization.getId(), currentUserId)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "You are already a member of this organization");
		}

		// Public organizations allow immediate joining
		if (Organization.Privacy.PUBLIC.equals(organization.getPrivacy())) {
			OrganizationUser member = organizationUserService.createMember(
					organization,
					currentUser,
					OrganizationUser.Role.MEMBER
			);

			// Save an approved request record for history
			OrganizationJoinRequest historyRequest = OrganizationJoinRequest.create(
					organization,
					currentUser,
					requestDto.getMessage()
			);
			historyRequest.approve(currentUser);
			OrganizationJoinRequest savedRequest = organizationJoinRequestRepository.save(historyRequest);

			return JoinResultResponseDto.builder()
					.status("JOINED")
					.message("Successfully joined organization: " + organization.getName())
					.organizationUser(organizationUserMapper.toDto(member))
					.joinRequest(organizationJoinRequestMapper.toDto(savedRequest))
					.build();
		}

		// Private organizations require manager approval
		if (organizationJoinRequestRepository.existsByOrganizationIdAndCreatorIdAndStatus(
				organization.getId(),
				currentUserId,
				OrganizationJoinRequest.Status.PENDING
		)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "A pending join request already exists for this organization");
		}

		OrganizationJoinRequest joinRequest = OrganizationJoinRequest.create(
				organization,
				currentUser,
				requestDto.getMessage()
		);
		OrganizationJoinRequest savedRequest = organizationJoinRequestRepository.save(joinRequest);

		return JoinResultResponseDto.builder()
				.status("PENDING")
				.message("Join request submitted successfully. Awaiting approval from organization managers.")
				.joinRequest(organizationJoinRequestMapper.toDto(savedRequest))
				.build();
	}

	@Transactional(readOnly = true)
	public List<JoinRequestResponseDto> getOrganizationJoinRequests(
			Long orgId,
			OrganizationJoinRequest.Status status,
			Long currentUserId
	) {
		organizationService.throwIfNotExistsById(orgId);
		organizationUserService.requireManager(orgId, currentUserId);

		List<OrganizationJoinRequest> requests;
		if (status != null) {
			requests = organizationJoinRequestRepository.findAllByOrganizationIdAndStatusOrderByCreatedAtDesc(orgId, status);
		} else {
			requests = organizationJoinRequestRepository.findAllByOrganizationIdOrderByCreatedAtDesc(orgId);
		}

		return organizationJoinRequestMapper.toDtoList(requests);
	}

	@Transactional(readOnly = true)
	public List<JoinRequestResponseDto> getMyJoinRequests(
			OrganizationJoinRequest.Status status,
			Long currentUserId
	) {
		List<OrganizationJoinRequest> requests;
		if (status != null) {
			requests = organizationJoinRequestRepository.findAllByCreatorIdAndStatusOrderByCreatedAtDesc(currentUserId, status);
		} else {
			requests = organizationJoinRequestRepository.findAllByCreatorIdOrderByCreatedAtDesc(currentUserId);
		}

		return organizationJoinRequestMapper.toDtoList(requests);
	}

	@Transactional
	public JoinRequestResponseDto approveJoinRequest(Long requestId, Long currentUserId) {
		OrganizationJoinRequest request = findByIdOrThrow(requestId);

		if (!request.isPending()) {
			throw new GlobalException(
					GlobalException.Type.INVALID_REQUEST,
					"Join request is not pending (current status: " + request.getStatus() + ")"
			);
		}

		organizationUserService.requireManager(request.getOrganization().getId(), currentUserId);
		User actor = userService.findByIdOrThrow(currentUserId);

		// If creator is not already a member, add to organization
		if (!organizationUserService.isUserInOrganization(request.getOrganization().getId(), request.getCreator().getId())) {
			organizationUserService.createMember(
					request.getOrganization(),
					request.getCreator(),
					OrganizationUser.Role.MEMBER
			);
		}

		request.approve(actor);
		OrganizationJoinRequest saved = organizationJoinRequestRepository.save(request);
		return organizationJoinRequestMapper.toDto(saved);
	}

	@Transactional
	public JoinRequestResponseDto rejectJoinRequest(
			Long requestId,
			RejectJoinRequestDto rejectDto,
			Long currentUserId
	) {
		OrganizationJoinRequest request = findByIdOrThrow(requestId);

		if (!request.isPending()) {
			throw new GlobalException(
					GlobalException.Type.INVALID_REQUEST,
					"Join request is not pending (current status: " + request.getStatus() + ")"
			);
		}

		organizationUserService.requireManager(request.getOrganization().getId(), currentUserId);
		User actor = userService.findByIdOrThrow(currentUserId);

		String reason = (rejectDto != null && rejectDto.getRejectReason() != null)
				? rejectDto.getRejectReason().trim()
				: null;

		request.reject(actor, reason);
		OrganizationJoinRequest saved = organizationJoinRequestRepository.save(request);
		return organizationJoinRequestMapper.toDto(saved);
	}

	@Transactional
	public JoinRequestResponseDto cancelJoinRequest(Long requestId, Long currentUserId) {
		OrganizationJoinRequest request = findByIdOrThrow(requestId);

		if (!request.isPending()) {
			throw new GlobalException(
					GlobalException.Type.INVALID_REQUEST,
					"Join request is not pending (current status: " + request.getStatus() + ")"
			);
		}

		if (!request.getCreator().getId().equals(currentUserId)) {
			throw new GlobalException(
					GlobalException.Type.FORBIDDEN,
					"You can only cancel your own join requests"
			);
		}

		User actor = userService.findByIdOrThrow(currentUserId);
		request.cancel(actor);
		OrganizationJoinRequest saved = organizationJoinRequestRepository.save(request);
		return organizationJoinRequestMapper.toDto(saved);
	}

	@Transactional(readOnly = true)
	public OrganizationJoinRequest findByIdOrThrow(Long id) {
		return organizationJoinRequestRepository
				.findById(id)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "Join request not found with ID: " + id)
				);
	}

}
