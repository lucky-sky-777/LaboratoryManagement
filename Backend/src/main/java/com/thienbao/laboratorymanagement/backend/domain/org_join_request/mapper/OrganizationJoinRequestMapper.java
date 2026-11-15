package com.thienbao.laboratorymanagement.backend.domain.org_join_request.mapper;

import com.thienbao.laboratorymanagement.backend.config.MapStructConfig;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.dto.JoinRequestResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org_join_request.entity.OrganizationJoinRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(config = MapStructConfig.class)
public interface OrganizationJoinRequestMapper {

	@Mapping(target = "organizationId", source = "organization.id")
	@Mapping(target = "organizationName", source = "organization.name")
	@Mapping(target = "organizationCode", source = "organization.code")
	@Mapping(target = "creatorUserId", source = "creator.id")
	@Mapping(target = "creatorUsername", source = "creator.username")
	@Mapping(target = "creatorDisplayName", source = "creator.displayName")
	@Mapping(target = "creatorAvatarUrl", source = "creator.avatarUrl")
	@Mapping(target = "creatorEmail", source = "creator.email")
	@Mapping(target = "actorUserId", source = "actor.id")
	@Mapping(target = "actorUsername", source = "actor.username")
	@Mapping(target = "actorDisplayName", source = "actor.displayName")
	JoinRequestResponseDto toDto(OrganizationJoinRequest request);

	List<JoinRequestResponseDto> toDtoList(List<OrganizationJoinRequest> requests);

}
