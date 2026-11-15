package com.thienbao.laboratorymanagement.backend.domain.org_user.service;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.UserService;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import com.thienbao.laboratorymanagement.backend.domain.org.service.OrganizationService;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.AddMemberRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.OrganizationUserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import com.thienbao.laboratorymanagement.backend.domain.org_user.mapper.OrganizationUserMapper;
import com.thienbao.laboratorymanagement.backend.domain.org_user.repository.OrganizationUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class OrganizationUserService {

	OrganizationUserRepository organizationUserRepository;
	OrganizationService organizationService;
	UserService userService;
	OrganizationUserMapper organizationUserMapper;

	@Transactional(readOnly = true)
	public boolean isUserInOrganization(Long orgId, Long userId) {
		return organizationUserRepository.existsByOrganizationIdAndUserId(orgId, userId);
	}

	@Transactional(readOnly = true)
	public OrganizationUser getMemberOrThrow(Long orgId, Long userId) {
		return organizationUserRepository
				.findByOrganizationIdAndUserId(orgId, userId)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "User is not a member of this organization")
				);
	}

	@Transactional(readOnly = true)
	public boolean isOwner(Long orgId, Long userId) {
		return organizationUserRepository
				.findByOrganizationIdAndUserId(orgId, userId)
				.map(member -> OrganizationUser.Role.OWNER.equals(member.getRole()))
				.orElse(false);
	}

	@Transactional(readOnly = true)
	public boolean isManager(Long orgId, Long userId) {
		return organizationUserRepository
				.findByOrganizationIdAndUserId(orgId, userId)
				.map(member -> OrganizationUser.Role.OWNER.equals(member.getRole())
						|| OrganizationUser.Role.ORGANIZATION_MANAGER.equals(member.getRole()))
				.orElse(false);
	}

	public void requireManager(Long orgId, Long userId) {
		if (!isManager(orgId, userId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "You do not have management permissions for this organization");
		}
	}

	public void requireOwner(Long orgId, Long userId) {
		if (!isOwner(orgId, userId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Only the organization owner can perform this action");
		}
	}

	@Transactional(readOnly = true)
	public List<OrganizationUserResponseDto> getOrganizationMembers(Long orgId, Long currentUserId) {
		organizationService.throwIfNotExistsById(orgId);
		if (!isUserInOrganization(orgId, currentUserId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "You must be a member of this organization to view its members");
		}

		List<OrganizationUser> members = organizationUserRepository.findAllByOrganizationId(orgId);
		return organizationUserMapper.toDtoList(members);
	}

	@Transactional(readOnly = true)
	public List<OrganizationUserResponseDto> getMyOrganizations(Long currentUserId) {
		List<OrganizationUser> memberships = organizationUserRepository.findAllByUserId(currentUserId);
		return organizationUserMapper.toDtoList(memberships);
	}

	@Transactional
	public OrganizationUser createMember(Organization organization, User user, OrganizationUser.Role role) {
		if (isUserInOrganization(organization.getId(), user.getId())) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "User is already a member of this organization");
		}

		OrganizationUser organizationUser = OrganizationUser.create(
				organization,
				user,
				role != null ? role : OrganizationUser.Role.MEMBER
		);

		return organizationUserRepository.save(organizationUser);
	}

	@Transactional
	public OrganizationUserResponseDto addMember(Long orgId, AddMemberRequestDto request, Long currentUserId) {
		Organization organization = organizationService.findByIdOrThrow(orgId);
		requireManager(orgId, currentUserId);

		OrganizationUser.Role role = request.getRole() != null ? request.getRole() : OrganizationUser.Role.MEMBER;

		if (OrganizationUser.Role.OWNER.equals(role)) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Cannot add a member as OWNER. Use transfer ownership instead.");
		}

		if (OrganizationUser.Role.ORGANIZATION_MANAGER.equals(role) && !isOwner(orgId, currentUserId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Only the OWNER can appoint an Organization Manager.");
		}

		User targetUser;
		if (request.getUserId() != null) {
			targetUser = userService.findByIdOrThrow(request.getUserId());
		} else if (request.getUsername() != null && !request.getUsername().isBlank()) {
			targetUser = userService.findByUsernameOrThrow(request.getUsername().trim());
		} else {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "User ID or username must be provided");
		}

		OrganizationUser saved = createMember(organization, targetUser, role);
		return organizationUserMapper.toDto(saved);
	}

	@Transactional
	public OrganizationUserResponseDto updateMemberRole(
			Long orgId,
			Long targetUserId,
			OrganizationUser.Role newRole,
			Long currentUserId
	) {
		organizationService.throwIfNotExistsById(orgId);
		OrganizationUser targetMember = getMemberOrThrow(orgId, targetUserId);

		if (OrganizationUser.Role.OWNER.equals(targetMember.getRole())) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Cannot modify role of OWNER. Use transfer ownership instead.");
		}

		if (OrganizationUser.Role.OWNER.equals(newRole)) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Cannot assign OWNER role directly. Use transfer ownership instead.");
		}

		boolean isCurrentOwner = isOwner(orgId, currentUserId);
		boolean isCurrentManager = isManager(orgId, currentUserId);

		if (!isCurrentManager) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "You do not have permission to update member roles");
		}

		if (!isCurrentOwner) {
			// Current user is ORGANIZATION_MANAGER
			if (OrganizationUser.Role.ORGANIZATION_MANAGER.equals(targetMember.getRole())) {
				throw new GlobalException(GlobalException.Type.FORBIDDEN, "Organization Manager cannot modify role of another Organization Manager");
			}
			if (OrganizationUser.Role.ORGANIZATION_MANAGER.equals(newRole)) {
				throw new GlobalException(GlobalException.Type.FORBIDDEN, "Organization Manager cannot appoint another Organization Manager");
			}
		}

		targetMember.updateRole(newRole);
		OrganizationUser saved = organizationUserRepository.save(targetMember);
		return organizationUserMapper.toDto(saved);
	}

	@Transactional
	public void removeMember(Long orgId, Long targetUserId, Long currentUserId) {
		organizationService.throwIfNotExistsById(orgId);
		OrganizationUser targetMember = getMemberOrThrow(orgId, targetUserId);

		if (OrganizationUser.Role.OWNER.equals(targetMember.getRole())) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Cannot remove the owner of the organization");
		}

		boolean isCurrentOwner = isOwner(orgId, currentUserId);
		boolean isCurrentManager = isManager(orgId, currentUserId);

		if (!isCurrentManager) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "You do not have permission to remove members from this organization");
		}

		if (!isCurrentOwner && OrganizationUser.Role.ORGANIZATION_MANAGER.equals(targetMember.getRole())) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Organization Manager cannot remove another Organization Manager");
		}

		organizationUserRepository.delete(targetMember);
	}

	@Transactional
	public void leaveOrganization(Long orgId, Long currentUserId) {
		organizationService.throwIfNotExistsById(orgId);
		OrganizationUser currentMember = getMemberOrThrow(orgId, currentUserId);

		if (OrganizationUser.Role.OWNER.equals(currentMember.getRole())) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "Owner cannot leave the organization without transferring ownership");
		}

		organizationUserRepository.delete(currentMember);
	}

	@Transactional
	public OrganizationUserResponseDto transferOwnership(Long orgId, Long newOwnerUserId, Long currentUserId) {
		Organization organization = organizationService.findByIdOrThrow(orgId);
		requireOwner(orgId, currentUserId);

		if (currentUserId.equals(newOwnerUserId)) {
			throw new GlobalException(GlobalException.Type.INVALID_REQUEST, "You are already the owner of this organization");
		}

		OrganizationUser currentOwnerMember = getMemberOrThrow(orgId, currentUserId);
		OrganizationUser newOwnerMember = getMemberOrThrow(orgId, newOwnerUserId);

		// Transfer
		currentOwnerMember.updateRole(OrganizationUser.Role.ORGANIZATION_MANAGER);
		newOwnerMember.updateRole(OrganizationUser.Role.OWNER);
		organization.setCreator(newOwnerMember.getUser());

		organizationUserRepository.save(currentOwnerMember);
		OrganizationUser savedNewOwner = organizationUserRepository.save(newOwnerMember);
		organizationService.save(organization);

		return organizationUserMapper.toDto(savedNewOwner);
	}

}
