package com.thienbao.laboratorymanagement.backend.domain.org_join_request.repository;

import com.thienbao.laboratorymanagement.backend.domain.org_join_request.entity.OrganizationJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationJoinRequestRepository extends JpaRepository<OrganizationJoinRequest, Long> {

	Optional<OrganizationJoinRequest> findByOrganizationIdAndCreatorIdAndStatus(
			Long organizationId,
			Long creatorId,
			OrganizationJoinRequest.Status status
	);

	boolean existsByOrganizationIdAndCreatorIdAndStatus(
			Long organizationId,
			Long creatorId,
			OrganizationJoinRequest.Status status
	);

	List<OrganizationJoinRequest> findAllByOrganizationIdOrderByCreatedAtDesc(Long organizationId);

	List<OrganizationJoinRequest> findAllByOrganizationIdAndStatusOrderByCreatedAtDesc(
			Long organizationId,
			OrganizationJoinRequest.Status status
	);

	List<OrganizationJoinRequest> findAllByCreatorIdOrderByCreatedAtDesc(Long creatorId);

	List<OrganizationJoinRequest> findAllByCreatorIdAndStatusOrderByCreatedAtDesc(
			Long creatorId,
			OrganizationJoinRequest.Status status
	);

	long countByOrganizationIdAndStatus(Long organizationId, OrganizationJoinRequest.Status status);

}
