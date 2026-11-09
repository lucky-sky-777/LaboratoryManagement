package com.thienbao.laboratorymanagement.backend.domain.auth.oauth2.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.thienbao.laboratorymanagement.backend.common.constant.WarningConstant;
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

@SuppressWarnings({WarningConstant.SPELL_CHECKING_INSPECTION})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public final class MezonUser implements OAuthUser {

	@JsonProperty("user_id")
	String userId;

	@JsonProperty("mezon_id")
	String mezonId;

	@Override
	public User.Provider getProvider() {
		return User.Provider.MEZON;
	}

	@JsonProperty("sub")
	String sub;

	@JsonProperty("username")
	String username;

	@Override
	public String getCustomUsername() {
		return EmailProcessor.extractAndClean(email) + "-" + User.Provider.MEZON + "-" + DateTimeUtils.currentTimestamp();
	}

	@JsonProperty("display_name")
	String displayName;

	@JsonProperty("avatar")
	String avatarUrl;

	@JsonProperty("email")
	String email;

}