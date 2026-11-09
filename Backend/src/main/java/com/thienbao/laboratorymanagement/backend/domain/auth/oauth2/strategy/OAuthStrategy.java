package com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.strategy;

import com.thienbao.laboratorymanagement.backend.common.constant.WarningConstant;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.dto.signin.SignInResponseDto;

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
public interface OAuthStrategy {

	String GOOGLE = "google";
	String MEZON = "mezon";

	String getName();
	String getAuthUrl(String state);
	SignInResponseDto auth(String accessToken);

}