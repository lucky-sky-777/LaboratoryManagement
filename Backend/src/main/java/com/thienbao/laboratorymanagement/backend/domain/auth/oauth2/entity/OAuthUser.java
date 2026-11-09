package com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.entity;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;

public sealed interface OAuthUser permits GoogleUser, MezonUser {

	User.Provider getProvider();
	String getSub();
	String getCustomUsername();
	String getDisplayName();
	String getAvatarUrl();
	String getEmail();

}