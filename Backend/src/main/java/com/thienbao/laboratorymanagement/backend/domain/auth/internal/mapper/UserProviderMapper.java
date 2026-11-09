package com.thienbao.laboratorymanagement.backend.domain.auth.internal.mapper;


import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import com.thienbao.laboratorymanagement.backend.common.exception.entity.GlobalException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public final class UserProviderMapper {

	private static final Map<String, User.Provider> mappings = new HashMap<>() {
		{
			put(User.Provider.GOOGLE.name().toLowerCase(Locale.ROOT), User.Provider.GOOGLE);
			put(User.Provider.MEZON.name().toLowerCase(Locale.ROOT), User.Provider.MEZON);
			put(User.Provider.INTERNAL.name().toLowerCase(Locale.ROOT), User.Provider.INTERNAL);
		}
	};

	public static User.Provider toUserProvider(String userProvider) {
		User.Provider provider = mappings.getOrDefault(userProvider.toLowerCase(Locale.ROOT), null);

		if (provider == null) {
			throw new GlobalException(GlobalException.Type.NOT_FOUND, "User provider not found");
		}

		return provider;
	}

}