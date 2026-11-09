package com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.strategy.impl;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.signin.SignInResponseDto;
import com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.entity.MezonUser;
import com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.env.MezonEnv;
import com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.service.MezonOAuthService;
import com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.strategy.OAuthStrategy;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Service(OAuthStrategy.MEZON)
public class MezonOAuthStrategy implements OAuthStrategy {

	AuthService authService;
	MezonEnv mezonEnv;
	MezonOAuthService mezonOAuthService;

	@Override
	public String getName() {
		return MEZON;
	}

	@Override
	public String getAuthUrl(String state) {
		return String.format(
				"%s?client_id=%s&redirect_uri=%s&response_type=code&scope=openid+offline&state=%s",
				mezonEnv.AUTH_URL,
				mezonEnv.CLIENT_ID,
				mezonEnv.REDIRECT_URI,
				state
		);
	}

	@Override
	public SignInResponseDto auth(String accessToken) {
		MezonUser mezonUser = mezonOAuthService.getUserInfo(accessToken);
		return authService.signInMezon(mezonUser);
	}

}