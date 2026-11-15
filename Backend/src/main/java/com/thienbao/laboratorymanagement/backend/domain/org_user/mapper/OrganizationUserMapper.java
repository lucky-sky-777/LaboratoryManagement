package com.thienbao.laboratorymanagement.backend.domain.org_user.mapper;

import com.thienbao.laboratorymanagement.backend.config.MapStructConfig;
import com.thienbao.laboratorymanagement.backend.domain.org_user.dto.OrganizationUserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = MapStructConfig.class)
public interface OrganizationUserMapper {

	@Mapping(target = "organizationId", source = "organization.id")
	@Mapping(target = "organizationName", source = "organization.name")
	@Mapping(target = "organizationCode", source = "organization.code")
	@Mapping(target = "userId", source = "user.id")
	@Mapping(target = "username", source = "user.username")
	@Mapping(target = "displayName", source = "user.displayName")
	@Mapping(target = "avatarUrl", source = "user.avatarUrl")
	@Mapping(target = "email", source = "user.email")
	OrganizationUserResponseDto toDto(OrganizationUser organizationUser);

	List<OrganizationUserResponseDto> toDtoList(List<OrganizationUser> organizationUsers);

}
