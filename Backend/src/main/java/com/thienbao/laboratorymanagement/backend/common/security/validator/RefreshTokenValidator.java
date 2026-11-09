package com.thienbao.laboratorymanagement.backend.common.security.validator;

import com.thienbao.laboratorymanagement.backend.common.constant.JwtConstant;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.JwtService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Component
public class RefreshTokenValidator implements OAuth2TokenValidator<Jwt> {

	@NullMarked
	@Override
	public OAuth2TokenValidatorResult validate(Jwt jwt) {
		String type = JwtService.extractTypeFromJwt(jwt);

		if (!JwtConstant.TYPE_REFRESH.equals(type)) {
			return OAuth2TokenValidatorResult.failure(
					new OAuth2Error(
							"invalid_token",
							"Only refresh tokens are accepted",
							null
					)
			);
		}

		return OAuth2TokenValidatorResult.success();
	}
}