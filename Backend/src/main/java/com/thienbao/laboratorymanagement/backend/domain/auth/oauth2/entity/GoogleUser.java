package com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.common.util.DateTimeUtils;
import com.thienbao.laboratorymanagement.backend.common.util.EmailProcessor;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public final class GoogleUser implements OAuthUser {

	@Override
	public User.Provider getProvider() {
		return User.Provider.GOOGLE;
	}

	@JsonProperty(value = "sub")
	String sub;

	@Override
	public String getCustomUsername() {
		return EmailProcessor.extractAndClean(email) + "-" + User.Provider.GOOGLE + "-" + DateTimeUtils.currentTimestamp();
	}

	@JsonProperty(value = "name")
	String displayName;

	@JsonProperty(value = "picture")
	String avatarUrl;

	@JsonProperty(value = "email")
	String email;

}