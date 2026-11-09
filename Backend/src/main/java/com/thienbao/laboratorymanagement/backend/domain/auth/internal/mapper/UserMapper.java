package com.thienbao.laboratorymanagement.backend.domain.auth.internal.mapper;

import com.thienbao.laboratorymanagement.backend.config.MapStructConfig;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.request.SignUpRequestDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.response.UserResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import org.mapstruct.Mapper;

@Mapper(config = MapStructConfig.class)
public interface UserMapper {
	User toUser(SignUpRequestDto request);
	UserResponseDto toUserResponseDto(User user);
}