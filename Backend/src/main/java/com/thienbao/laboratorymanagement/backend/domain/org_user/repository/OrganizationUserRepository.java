package com.thienbao.laboratorymanagement.backend.domain.org_user.repository;

import com.thienbao.laboratorymanagement.backend.domain.org_user.entity.OrganizationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, Long> {

	Optional<OrganizationUser> findByOrganizationIdAndUserId(Long organizationId, Long userId);

	boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);

	List<OrganizationUser> findAllByOrganizationId(Long organizationId);

	List<OrganizationUser> findAllByUserId(Long userId);

	long countByOrganizationId(Long organizationId);

	Optional<OrganizationUser> findByOrganizationIdAndRole(Long organizationId, OrganizationUser.Role role);

	void deleteByOrganizationIdAndUserId(Long organizationId, Long userId);

}
