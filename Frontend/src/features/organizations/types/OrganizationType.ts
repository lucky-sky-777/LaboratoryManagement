import type { UserProfile } from "../../auth/types/AuthType";

export type OrganizationPrivacy = "PUBLIC" | "PRIVATE";

export type OrganizationRole =
  | "OWNER"
  | "ORGANIZATION_MANAGER"
  | "LABORATORY_MANAGER"
  | "MEMBER";

export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ================= Org Domain =================

export interface OrganizationResponse {
  id: number;
  name: string;
  description: string | null;
  code: string;
  privacy: OrganizationPrivacy;
  creator_id: number;
  creator?: UserProfile;
  created_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
  code?: string;
  privacy?: OrganizationPrivacy;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  privacy?: OrganizationPrivacy;
}

// ================= Org User Domain =================

export interface OrganizationUserResponse {
  id: number;
  organization_id: number;
  organization_name: string;
  organization_code: string;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  email: string;
  role: OrganizationRole;
  joined_at: string;
}

export interface AddMemberRequest {
  user_id?: number;
  username?: string;
  role?: OrganizationRole;
}

export interface UpdateMemberRoleRequest {
  role: OrganizationRole;
}

export interface TransferOwnershipRequest {
  new_owner_user_id: number;
}

// ================= Org Join Request Domain =================

export interface CreateJoinRequest {
  code: string;
  message?: string;
}

export interface RejectJoinRequest {
  reject_reason?: string;
}

export interface JoinRequestResponse {
  id: number;
  organization_id: number;
  organization_name: string;
  organization_code: string;
  message: string;
  creator_user_id: number;
  creator_username: string;
  creator_display_name: string;
  creator_avatar_url: string;
  creator_email: string;
  status: JoinRequestStatus;
  actor_user_id?: number | null;
  actor_username?: string | null;
  actor_display_name?: string | null;
  acted_at?: string | null;
  reject_reason?: string | null;
  created_at: string;
}

export interface JoinResultResponse {
  status: "JOINED" | "PENDING";
  message: string;
  organization_user?: OrganizationUserResponse;
  join_request?: JoinRequestResponse;
}

/**
 * Combined View Model for Organization Item displayed on HomePage & Grid Cards
 */
export interface OrganizationItemDTO {
  id: number;
  name: string;
  description: string;
  code: string;
  privacy: OrganizationPrivacy;
  creator_user_id: number;
  created_at: string;

  // Current user's membership in this organization (from organization_users)
  user_role: OrganizationRole;
  user_joined_at: string;

  // Creator information (from users table)
  creator_display_name?: string;
  creator_email?: string;

  // Aggregated data
  members_count: number;
  pending_requests_count?: number;

  // UI Theme styling
  theme_color?: "emerald" | "blue" | "indigo" | "purple" | "amber" | "teal";
  is_pinned?: boolean;
}

export function isManagerRole(role: OrganizationRole): boolean {
  return (
    role === "OWNER" ||
    role === "ORGANIZATION_MANAGER" ||
    role === "LABORATORY_MANAGER"
  );
}

export function getRoleLabel(role: OrganizationRole): string {
  switch (role) {
    case "OWNER":
      return "Chủ sở hữu";
    case "ORGANIZATION_MANAGER":
      return "Quản lý tổ chức";
    case "LABORATORY_MANAGER":
      return "Quản lý phòng lab";
    case "MEMBER":
      return "Thành viên";
    default:
      return role;
  }
}
