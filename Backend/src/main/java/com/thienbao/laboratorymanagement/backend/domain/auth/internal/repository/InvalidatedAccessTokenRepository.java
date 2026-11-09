package com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.InvalidatedAccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedAccessTokenRepository extends JpaRepository<InvalidatedAccessToken, Long> {

	boolean existsByJti(String jti);

}