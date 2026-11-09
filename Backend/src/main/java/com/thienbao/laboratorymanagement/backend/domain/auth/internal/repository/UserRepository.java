package com.thienbao.laboratorymanagement.backend.domain.auth.internal.repository;

import com.thienbao.laboratorymanagement.backend.domain.auth.internal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByUsername(String username);

	boolean existsByUsername(String username);

	Optional<User> findByProviderId(String providerId);

	boolean existsByProviderId(String providerId);

}