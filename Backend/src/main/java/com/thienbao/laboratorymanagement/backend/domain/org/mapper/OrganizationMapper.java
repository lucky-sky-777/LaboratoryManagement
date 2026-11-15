package com.thienbao.laboratorymanagement.backend.domain.org.mapper;

import com.thienbao.laboratorymanagement.backend.config.MapStructConfig;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.mapper.UserMapper;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.CreateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.request.UpdateOrganizationRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.org.dto.response.OrganizationResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.org.entity.Organization;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
		config = MapStructConfig.class,
		uses = {UserMapper.class}
)
public interface OrganizationMapper {

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "creator", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	Organization toOrganization(CreateOrganizationRequestDto request);

	@Mapping(source = "creator.id", target = "creatorId")
	@Mapping(source = "creator", target = "creator")
	OrganizationResponseDto toOrganizationResponseDto(Organization organization);

	List<OrganizationResponseDto> toOrganizationResponseDtoList(List<Organization> organizations);

	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	@Mapping(target = "id", ignore = true)
	@Mapping(target = "code", ignore = true)
	@Mapping(target = "creator", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	void updateOrganizationFromDto(UpdateOrganizationRequestDto request, @MappingTarget Organization organization);

}
