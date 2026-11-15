package com.thienbao.laboratorymanagement.backend.domain.org.service;

import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.UserService;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.CreateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.UpdateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.response.OrganizationResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import com.thienbao.laboratorymanagement.backend.domain.org.mapper.OrganizationMapper;
import com.thienbao.laboratorymanagement.backend.domain.org.repository.OrganizationRepository;
import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import com.thienbao.laboratorymanagement.backend.domain.org_user.repository.OrganizationUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service
public class OrganizationService {

	OrganizationRepository organizationRepository;
	OrganizationUserRepository organizationUserRepository;
	UserService userService;
	OrganizationMapper organizationMapper;

	@Transactional
	public OrganizationResponseDto createOrganization(CreateOrganizationRequestDto request, Long currentUserId) {
		User creator = userService.findByIdOrThrow(currentUserId);

		if (request.getCode() != null && !request.getCode().isBlank()) {
			throwIfExistsByCode(request.getCode().trim().toUpperCase());
		}

		Organization organization = organizationMapper.toOrganization(request);
		organization.setCreator(creator);

		Organization saved = organizationRepository.save(organization);

		// Automatically add creator as OWNER in organization_users
		OrganizationUser ownerMembership = OrganizationUser.create(
				saved,
				creator,
				OrganizationUser.Role.OWNER
		);
		organizationUserRepository.save(ownerMembership);

		return organizationMapper.toOrganizationResponseDto(saved);
	}

	@Transactional(readOnly = true)
	public OrganizationResponseDto getById(Long id) {
		Organization organization = findByIdOrThrow(id);
		return organizationMapper.toOrganizationResponseDto(organization);
	}

	@Transactional(readOnly = true)
	public OrganizationResponseDto getByCode(String code) {
		Organization organization = findByCodeOrThrow(code);
		return organizationMapper.toOrganizationResponseDto(organization);
	}

	@Transactional(readOnly = true)
	public Page<OrganizationResponseDto> getAll(Pageable pageable) {
		return organizationRepository.findAll(pageable)
				.map(organizationMapper::toOrganizationResponseDto);
	}

	@Transactional(readOnly = true)
	public Page<OrganizationResponseDto> getByCreatorId(Long creatorId, Pageable pageable) {
		return organizationRepository.findAllByCreatorId(creatorId, pageable)
				.map(organizationMapper::toOrganizationResponseDto);
	}

	@Transactional(readOnly = true)
	public Page<OrganizationResponseDto> getPublicOrganizations(Pageable pageable) {
		return organizationRepository.findAllByPrivacy(Organization.Privacy.PUBLIC, pageable)
				.map(organizationMapper::toOrganizationResponseDto);
	}

	@Transactional
	public OrganizationResponseDto updateOrganization(Long id, UpdateOrganizationRequestDto request, Long currentUserId) {
		Organization organization = findByIdOrThrow(id);

		if (!organization.getCreator().getId().equals(currentUserId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Only the creator/owner can update this organization");
		}

		organizationMapper.updateOrganizationFromDto(request, organization);
		Organization saved = organizationRepository.save(organization);
		return organizationMapper.toOrganizationResponseDto(saved);
	}

	@Transactional
	public void deleteById(Long id, Long currentUserId) {
		Organization organization = findByIdOrThrow(id);

		if (!organization.getCreator().getId().equals(currentUserId)) {
			throw new GlobalException(GlobalException.Type.FORBIDDEN, "Only the creator/owner can delete this organization");
		}

		organizationRepository.delete(organization);
	}

	@Transactional(readOnly = true)
	public Organization findByIdOrThrow(Long id) {
		return organizationRepository
				.findById(id)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "Organization not found with ID: " + id)
				);
	}

	@Transactional(readOnly = true)
	public Organization findByCodeOrThrow(String code) {
		return organizationRepository
				.findByCode(code)
				.orElseThrow(() ->
						new GlobalException(GlobalException.Type.NOT_FOUND, "Organization not found with code: " + code)
				);
	}

	@Transactional
	public Organization save(Organization organization) {
		return organizationRepository.save(organization);
	}

	@Transactional(readOnly = true)
	public boolean existsById(Long id) {
		return organizationRepository.existsById(id);
	}

	@Transactional(readOnly = true)
	public boolean existsByCode(String code) {
		return organizationRepository.existsByCode(code);
	}

	public void throwIfNotExistsById(Long id) {
		if (!existsById(id)) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "Organization not found with ID: " + id);
		}
	}

	public void throwIfExistsByCode(String code) {
		if (existsByCode(code)) {
			throw new GlobalException(GlobalException.Type.ALREADY_EXISTS, "Organization code already exists: " + code);
		}
	}

}
