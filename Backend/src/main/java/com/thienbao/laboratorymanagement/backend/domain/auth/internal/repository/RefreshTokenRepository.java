package com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByJti(String jti);

}